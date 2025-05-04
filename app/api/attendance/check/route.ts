import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Enable test mode - allows requests without authentication
const TEST_MODE = true;

export async function GET(request: Request) {
  try {
    console.log(">> Starting attendance check");

    // Get auth session
    const session = await getServerSession(authOptions);
    let userId;

    // For API testing, allow cookie-based auth or test mode
    const cookies = request.headers.get("cookie");
    const hasAuthCookie =
      cookies && cookies.includes("next-auth.session-token");

    if (!session?.user && !hasAuthCookie && !TEST_MODE) {
      console.log("Authentication failed - no session or auth cookie");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const scheduleId = searchParams.get("scheduleId");

    if (!courseId || !scheduleId) {
      return NextResponse.json(
        { message: "Course ID and Schedule ID are required" },
        { status: 400 }
      );
    }

    console.log(
      `Checking attendance for user ${userId}, course ${courseId}, schedule ${scheduleId}`
    );

    // Check if the user is enrolled in this course
    const enrollment = await prisma.courseUser.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();

    // Parse the schedule format (e.g., "Monday-09:00")
    // This helps us find lectures that match the day of the week
    let dayOfWeek = "";
    let timeOfDay = "";

    if (scheduleId.includes("-")) {
      const parts = scheduleId.split("-");
      dayOfWeek = parts[0].toLowerCase();
      timeOfDay = parts[1];
    }

    // Get the current day of the week
    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDayOfWeek = daysOfWeek[today.getDay()];

    // Only check for day match if we're looking for today's lectures
    const shouldCheckDay = dayOfWeek.toLowerCase() === currentDayOfWeek;

    console.log(
      `Current day: ${currentDayOfWeek}, Schedule day: ${dayOfWeek}, Should check: ${shouldCheckDay}`
    );

    // Find active lecture for this course today
    const activeLecture = await prisma.lecture.findFirst({
      where: {
        courseId: courseId,
        date: {
          equals: today,
        },
        startTime: {
          lte: now,
        },
        endTime: {
          gte: now,
        },
      },
      include: {
        course: true,
      },
    });

    if (activeLecture) {
      console.log(`Found active lecture: ${activeLecture.id}`);
    } else {
      console.log("No active lecture found, checking for scheduled time");
    }

    if (!activeLecture) {
      // If no active lecture found, check if there's a lecture scheduled for today
      // that matches the requested schedule

      // For demo purposes, create a temporary lecture
      if (shouldCheckDay || true) {
        // Always check for demo
        // Create a time from the schedule (e.g., "09:00")
        let hours = 9,
          minutes = 0;
        if (timeOfDay && timeOfDay.includes(":")) {
          [hours, minutes] = timeOfDay.split(":").map(Number);
        }

        const startTime = new Date(today);
        startTime.setHours(hours, minutes, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1, endTime.getMinutes() + 30); // 1.5 hour lecture

        // Check if now is within the scheduled time (with some flexibility)
        const scheduleStartTime = new Date(startTime);
        scheduleStartTime.setMinutes(scheduleStartTime.getMinutes() - 30); // Allow joining 30 min early

        const scheduleEndTime = new Date(endTime);
        scheduleEndTime.setMinutes(scheduleEndTime.getMinutes() + 30); // Allow joining 30 min late

        console.log(
          `Schedule time: ${startTime.toISOString()} - ${endTime.toISOString()}`
        );
        console.log(
          `Extended window: ${scheduleStartTime.toISOString()} - ${scheduleEndTime.toISOString()}`
        );
        console.log(`Current time: ${now.toISOString()}`);

        // For demo purposes, always allow
        const isWithinWindow = true; // now >= scheduleStartTime && now <= scheduleEndTime;

        if (isWithinWindow) {
          console.log("Current time is within the allowed window");

          // Find a lecture for this course today
          const lecture = await prisma.lecture.findFirst({
            where: {
              courseId: courseId,
              date: {
                equals: today,
              },
            },
            include: {
              course: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          // For demo purposes, create a lecture if none exists
          if (!lecture) {
            console.log("No lecture found, creating a demo lecture");

            // Create a demo lecture
            const userRole = session?.user?.role || "STUDENT";

            if (userRole === "STUDENT") {
              // Students can't create lectures
              return NextResponse.json(
                {
                  message:
                    "No active lecture found for this course and schedule. Please wait for your teacher to start the lecture.",
                },
                { status: 404 }
              );
            }

            // Find a teacher for this course
            const teacher = await prisma.courseUser.findFirst({
              where: {
                courseId: courseId,
                role: "TEACHER",
              },
              include: {
                user: true,
              },
            });

            if (!teacher) {
              return NextResponse.json(
                { message: "No teacher found for this course" },
                { status: 404 }
              );
            }

            // Create a new lecture
            const newLecture = await prisma.lecture.create({
              data: {
                title: `${new Date().toLocaleDateString()} Lecture`,
                courseId: courseId,
                takenById: teacher.userId,
                type: "LECTURE",
                date: today,
                startTime: startTime,
                endTime: endTime,
                verifyType: "OTP",
                otpCode: "123456", // Default OTP for testing
              },
              include: {
                course: true,
              },
            });

            console.log(`Created demo lecture with ID: ${newLecture.id}`);

            return NextResponse.json({
              message: "Active lecture found, proceed with verification",
              lecture: {
                id: newLecture.id,
                title: newLecture.title,
                course: newLecture.course.name,
                verifyType: newLecture.verifyType,
              },
            });
          }

          // Check if attendance is already marked
          const existingAttendance = await prisma.attendance.findUnique({
            where: {
              userId_lectureId: {
                userId: userId,
                lectureId: lecture.id,
              },
            },
          });

          if (existingAttendance) {
            return NextResponse.json(
              { message: "Attendance already marked for this session" },
              { status: 409 }
            );
          }

          // Set a default OTP code if none exists (for testing)
          if (!lecture.otpCode) {
            await prisma.lecture.update({
              where: { id: lecture.id },
              data: { otpCode: "123456" },
            });
          }

          return NextResponse.json({
            message: "Active lecture found, proceed with verification",
            lecture: {
              id: lecture.id,
              title: lecture.title,
              course: lecture.course.name,
              verifyType: lecture.verifyType || "OTP",
            },
          });
        }
      }

      return NextResponse.json(
        { message: "No active lecture found for this course and schedule" },
        { status: 404 }
      );
    }

    // Check if attendance is already marked
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_lectureId: {
          userId: userId,
          lectureId: activeLecture.id,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { message: "Attendance already marked for this session" },
        { status: 409 }
      );
    }

    // Set a default OTP code if none exists (for testing)
    if (!activeLecture.otpCode) {
      await prisma.lecture.update({
        where: { id: activeLecture.id },
        data: { otpCode: "123456" },
      });
    }

    return NextResponse.json({
      message: "Active lecture found, proceed with verification",
      lecture: {
        id: activeLecture.id,
        title: activeLecture.title,
        course: activeLecture.course.name,
        verifyType: activeLecture.verifyType,
      },
    });
  } catch (error) {
    console.error("Error checking lecture status:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
