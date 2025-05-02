import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { LectureType, VerifyType } from "@prisma/client";

// POST: Create a new lecture session
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

    const {
      courseId,
      title,
      date,
      startTime,
      endTime,
      type = "LECTURE",
      verifyType = "MANUAL",
    } = await req.json();

    if (!courseId || !title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { message: "Missing required fields" },
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

    // Create the lecture session
    const lecture = await prisma.lecture.create({
      data: {
        title,
        courseId,
        takenById: session.user.id,
        type: type as LectureType,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        verifyType: verifyType as VerifyType,
      },
    });

    return NextResponse.json(lecture);
  } catch (error) {
    console.error("Error creating lecture session:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
