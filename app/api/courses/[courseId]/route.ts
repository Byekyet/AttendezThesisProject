import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: Fetch a specific course by ID
export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Ensure params is awaited if it's a promise
    const { courseId } = params;

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if the user is enrolled in this course
    const enrollment = await prisma.courseUser.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // Get the course details
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
