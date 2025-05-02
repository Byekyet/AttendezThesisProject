import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: Fetch all lecture sessions for a course
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only teachers can access this endpoint
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

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

    // Get lecture sessions for this course
    const lectures = await prisma.lecture.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        date: "desc",
      },
      take: 10, // Limit to recent sessions
    });

    return NextResponse.json(lectures);
  } catch (error) {
    console.error("Error fetching lecture sessions:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
