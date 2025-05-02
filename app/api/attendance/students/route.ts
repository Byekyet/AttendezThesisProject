import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: Fetch all students enrolled in a course
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

    // Get students enrolled in this course
    const enrolledStudents = await prisma.courseUser.findMany({
      where: {
        courseId: courseId,
        role: "STUDENT",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    // Format the response to return just the necessary user data
    const students = enrolledStudents.map((enrollment) => ({
      id: enrollment.user.id,
      name: enrollment.user.name,
      email: enrollment.user.email,
      profileImage: enrollment.user.profileImage,
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching enrolled students:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
