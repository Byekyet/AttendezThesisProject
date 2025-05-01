import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ message: "OTP is required" }, { status: 400 });
    }

    // Find active lecture with this OTP code
    const lecture = await prisma.lecture.findFirst({
      where: {
        otpCode: otp,
        verifyType: "OTP",
        date: {
          // Today's date
          equals: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        startTime: {
          // Before now
          lte: new Date(),
        },
        endTime: {
          // After now
          gte: new Date(),
        },
      },
    });

    if (!lecture) {
      return NextResponse.json(
        { message: "Invalid or expired OTP code" },
        { status: 400 }
      );
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.courseUser.findFirst({
      where: {
        userId: session.user.id,
        courseId: lecture.courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // Check if user already has attendance record for this lecture
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_lectureId: {
          userId: session.user.id,
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
        userId: session.user.id,
        otp,
        verified: true,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour expiry
      },
    });

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: session.user.id,
        lectureId: lecture.id,
        status: "PRESENT",
      },
    });

    return NextResponse.json({
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
