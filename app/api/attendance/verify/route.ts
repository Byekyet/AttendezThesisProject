import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { otp, courseId, scheduleId } = await req.json();

    if (!otp) {
      return NextResponse.json({ message: "OTP is required" }, { status: 400 });
    }

    // For enhanced security, we could also validate courseId and scheduleId
    // But for simplicity, we'll focus on validating the OTP

    // Find a lecture with this OTP that is active now
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();

    const lecture = await prisma.lecture.findFirst({
      where: {
        otpCode: otp,
        verifyType: "OTP",
        courseId: courseId ? courseId : undefined,
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
    });

    if (!lecture) {
      return NextResponse.json(
        { message: "Invalid or expired OTP code" },
        { status: 400 }
      );
    }

    // Verify that the user is enrolled in this course
    const enrollment = await prisma.courseUser.findFirst({
      where: {
        userId: userId,
        courseId: lecture.courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
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

    // Create OTP session record
    const otpSession = await prisma.otpSession.create({
      data: {
        userId: userId,
        otp,
        verified: true,
        expiresAt: new Date(Date.now() + 3600 * 1000), // Expires in 1 hour
      },
    });

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: userId,
        lectureId: lecture.id,
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
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
