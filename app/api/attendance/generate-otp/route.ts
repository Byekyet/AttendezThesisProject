import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// POST: Generate OTP for a course attendance
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only teachers can access this endpoint
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if the teacher is assigned to this course
    const courseTeacher = await prisma.courseUser.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        role: "TEACHER",
      },
    });

    if (!courseTeacher) {
      return NextResponse.json(
        { message: "You are not assigned to this course" },
        { status: 403 }
      );
    }

    // Generate OTP code (6 digits)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);

    // Create a new lecture or use an existing one
    const currentDate = new Date();
    const startTime = new Date(currentDate);
    const endTime = new Date(currentDate);
    endTime.setMinutes(endTime.getMinutes() + 90); // 1.5 hour lecture

    // Check if there's an active lecture in progress
    const activeLecture = await prisma.lecture.findFirst({
      where: {
        courseId: courseId,
        date: {
          equals: new Date(currentDate.setHours(0, 0, 0, 0)),
        },
        startTime: {
          lte: currentDate,
        },
        endTime: {
          gte: currentDate,
        },
      },
    });

    let lecture;

    if (activeLecture) {
      // Update existing lecture with new OTP
      lecture = await prisma.lecture.update({
        where: {
          id: activeLecture.id,
        },
        data: {
          otpCode: otpCode,
          verifyType: "OTP",
        },
      });
    } else {
      // Create a new lecture with the OTP
      lecture = await prisma.lecture.create({
        data: {
          title: `${new Date().toLocaleDateString()} Lecture`,
          courseId: courseId,
          takenById: session.user.id,
          type: "LECTURE",
          date: new Date(currentDate.setHours(0, 0, 0, 0)),
          startTime: startTime,
          endTime: endTime,
          verifyType: "OTP",
          otpCode: otpCode,
        },
      });
    }

    return NextResponse.json({
      message: "OTP generated successfully",
      otp: otpCode,
      lectureId: lecture.id,
      expiry: expiryTime,
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
