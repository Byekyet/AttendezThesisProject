import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Enable test mode - allows requests without authentication
const TEST_MODE = true;

export async function POST(req: Request) {
  try {
    console.log(">> Starting OTP verification");

    // Get auth session
    const session = await getServerSession(authOptions);
    let userId;

    // For API testing, allow cookie-based auth or test mode
    const cookies = req.headers.get("cookie");
    const hasAuthCookie =
      cookies && cookies.includes("next-auth.session-token");

    if (!session?.user && !hasAuthCookie && !TEST_MODE) {
      console.log("Authentication failed - no session or auth cookie");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { otp, courseId, scheduleId, lectureId } = body;

    console.log("Request body:", body);

    // Get user ID from session or fallback to test user
    if (session?.user?.id) {
      userId = session.user.id;
      console.log(`Using authenticated user: ${userId}`);
    } else {
      console.log("No authenticated user, finding a test user");
      // For testing: Find first student user
      const testUser = await prisma.user.findFirst({
        where: { role: "STUDENT" },
      });

      if (!testUser) {
        console.log("No test user found in the database");
        return NextResponse.json(
          { message: "No test user found" },
          { status: 401 }
        );
      }

      userId = testUser.id;
      console.log(`Using test user: ${userId}`);
    }

    if (!otp) {
      console.log("OTP is required but missing");
      return NextResponse.json({ message: "OTP is required" }, { status: 400 });
    }

    if (!courseId) {
      console.log("Course ID is required but missing");
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    // Verify the user is enrolled in this course
    console.log(`Checking if user ${userId} is enrolled in course ${courseId}`);
    const enrollment = await prisma.courseUser.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });

    if (!enrollment && !TEST_MODE) {
      console.log("User is not enrolled in this course");
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    } else if (!enrollment) {
      console.log("User is not enrolled, but allowing in test mode");

      // Check if course exists first
      const courseExists = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!courseExists) {
        console.log(
          `Course ${courseId} does not exist, creating a test course`
        );
        // Create a test course
        await prisma.course.create({
          data: {
            id: courseId,
            name: "Test Course",
            code: `TEST-${new Date().getTime()}`,
            description: "Auto-created test course",
          },
        });
        console.log("Created test course");
      }

      // In test mode, create an enrollment
      await prisma.courseUser.create({
        data: {
          userId: userId,
          courseId: courseId,
          role: "STUDENT",
        },
      });
      console.log("Created test enrollment");
    }

    // For testing, allow a special test OTP
    const isTestOtp = otp === "703333";
    console.log(`Using ${isTestOtp ? "test" : "regular"} OTP validation`);

    // Find the active lecture
    let targetLectureId = lectureId;

    // If no lecture ID is provided but schedule ID is, find the active lecture
    if (!targetLectureId && scheduleId) {
      console.log(`Finding active lecture for schedule: ${scheduleId}`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const now = new Date();

      // Parse the schedule format (e.g., "Monday-09:00")
      const [dayName, timeStr] = scheduleId.split("-");
      console.log(`Schedule day: ${dayName}, time: ${timeStr}`);

      // Find active lecture for today and this course (most recent one)
      const activeLecture = await prisma.lecture.findFirst({
        where: {
          courseId: courseId,
          date: {
            equals: today,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          course: true,
        },
      });

      if (activeLecture) {
        console.log(
          `Found active lecture: ${activeLecture.id} - ${activeLecture.title}`
        );
        targetLectureId = activeLecture.id;
      } else if (TEST_MODE) {
        // In test mode, create a lecture if none exists
        console.log("No active lecture found, creating one for testing");

        // Find a teacher for this course
        const teacher = await prisma.user.findFirst({
          where: { role: "TEACHER" },
        });

        if (!teacher) {
          return NextResponse.json(
            { message: "No teacher found" },
            { status: 400 }
          );
        }

        // Create a new lecture
        const startTime = new Date(today);
        const [hours, minutes] = timeStr
          ? timeStr.split(":").map(Number)
          : [9, 0];
        startTime.setHours(hours, minutes, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1, endTime.getMinutes() + 30); // 1.5 hour lecture

        const newLecture = await prisma.lecture.create({
          data: {
            title: `${dayName} ${timeStr} Lecture`,
            courseId: courseId,
            takenById: teacher.id,
            type: "LECTURE",
            date: today,
            startTime: startTime,
            endTime: endTime,
            verifyType: "OTP",
            otpCode: isTestOtp ? otp : "123456", // Default OTP for testing
          },
          include: {
            course: true,
          },
        });

        console.log(
          `Created test lecture: ${newLecture.id} - ${newLecture.title}`
        );
        targetLectureId = newLecture.id;
      } else {
        return NextResponse.json(
          { message: "No active lecture found for this course and schedule" },
          { status: 404 }
        );
      }
    }

    if (!targetLectureId) {
      return NextResponse.json(
        { message: "Could not determine lecture ID" },
        { status: 400 }
      );
    }

    console.log(`Checking attendance for lecture: ${targetLectureId}`);

    // Check if attendance is already marked
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_lectureId: {
          userId: userId,
          lectureId: targetLectureId,
        },
      },
    });

    if (existingAttendance) {
      console.log("Attendance already marked");
      return NextResponse.json(
        { message: "Attendance already marked for this session" },
        { status: 409 }
      );
    }

    // Get the lecture details
    const lecture = await prisma.lecture.findUnique({
      where: {
        id: targetLectureId,
      },
      include: {
        course: true,
      },
    });

    if (!lecture) {
      console.log("Lecture not found");
      return NextResponse.json(
        { message: "Lecture not found" },
        { status: 404 }
      );
    }

    // Verify OTP
    let otpValid = false;

    // If it's the test OTP, always allow
    if (isTestOtp) {
      console.log("Using test OTP - automatically valid");
      otpValid = true;
    } else {
      // First check if the OTP matches the lecture's OTP code
      if (lecture.otpCode === otp) {
        console.log("OTP matches lecture's OTP code");
        otpValid = true;
      } else {
        // Otherwise check for a valid OTP session
        console.log("Checking for valid OTP session");
        const now = new Date();

        const validOtpSession = await prisma.otpSession.findFirst({
          where: {
            courseId: courseId,
            otp: otp,
            verified: false, // Only find unverified OTP sessions
            expiresAt: {
              gte: now,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (validOtpSession) {
          console.log(`Found valid OTP session: ${validOtpSession.id}`);
          otpValid = true;

          // Mark this session as verified
          await prisma.otpSession.update({
            where: { id: validOtpSession.id },
            data: { verified: true },
          });
        }
      }
    }

    if (!otpValid && !TEST_MODE) {
      console.log("Invalid or expired OTP");
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Create attendance record
    console.log("Creating attendance record");
    const attendance = await prisma.attendance.create({
      data: {
        userId: userId,
        lectureId: targetLectureId,
        status: "PRESENT",
      },
      include: {
        lecture: {
          include: {
            course: true,
          },
        },
      },
    });

    console.log(`Created attendance record: ${attendance.id}`);

    // Create a student OTP session record for tracking
    console.log("Creating OTP session record");
    try {
      await prisma.otpSession.create({
        data: {
          userId: userId,
          courseId: courseId,
          lectureId: targetLectureId,
          otp: otp,
          verified: true,
          expiresAt: new Date(Date.now() + 3600 * 1000), // Keep record for 1 hour
        },
      });
      console.log("Created OTP session record");
    } catch (err) {
      console.error("Error creating OTP session, but continuing:", err);
      // Continue even if this fails
    }

    console.log("Attendance marked successfully");
    return NextResponse.json({
      message: "Attendance marked successfully",
      attendance: {
        id: attendance.id,
        status: attendance.status,
        course: attendance.lecture.course.name,
        lecture: attendance.lecture.title,
        date: attendance.lecture.date,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
