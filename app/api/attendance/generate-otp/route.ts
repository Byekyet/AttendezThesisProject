import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Helper to generate a random N-digit OTP
function generateOTP(digits: number = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

// POST: Generate OTP for a course attendance
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const { lectureId, courseId, expirySeconds } = await req.json();

    if (!lectureId || !courseId) {
      return NextResponse.json(
        { message: "Lecture ID and Course ID are required" },
        { status: 400 }
      );
    }

    // Verify the teacher teaches this course
    const teacherCourse = await prisma.courseUser.findFirst({
      where: {
        userId: teacherId,
        courseId: courseId,
        role: "TEACHER",
      },
    });

    if (!teacherCourse) {
      return NextResponse.json(
        { message: "You are not authorized to teach this course" },
        { status: 403 }
      );
    }

    // Verify the lecture exists and belongs to this course
    const lecture = await prisma.lecture.findFirst({
      where: {
        id: lectureId,
        courseId: courseId,
      },
    });

    if (!lecture) {
      return NextResponse.json(
        { message: "Lecture not found" },
        { status: 404 }
      );
    }

    // Generate a new OTP
    const otp = generateOTP();

    // Get expiry time from env variable, or use the provided value, or default to 60 seconds
    const envExpirySeconds = process.env.OTP_EXPIRY_SECONDS
      ? parseInt(process.env.OTP_EXPIRY_SECONDS)
      : 60;
    const otpExpirySeconds = expirySeconds || envExpirySeconds;

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + otpExpirySeconds);

    // Update lecture with the new OTP
    const updatedLecture = await prisma.lecture.update({
      where: {
        id: lectureId,
      },
      data: {
        otpCode: otp,
        verifyType: "OTP",
      },
    });

    // Create OTP session
    const otpSession = await prisma.otpSession.create({
      data: {
        userId: teacherId,
        courseId: courseId,
        lectureId: lectureId,
        otp: otp,
        expiresAt: expiresAt,
        verified: false,
      },
    });

    return NextResponse.json({
      message: "OTP generated successfully",
      otp: otp,
      expiresAt: expiresAt,
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
