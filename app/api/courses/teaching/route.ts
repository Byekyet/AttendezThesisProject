import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is a teacher
    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Only teachers can access this endpoint" },
        { status: 403 }
      );
    }

    // Get all courses where the user is a teacher
    const teacherCourses = await prisma.courseUser.findMany({
      where: {
        userId: session.user.id,
        role: "TEACHER",
      },
      include: {
        course: true,
      },
    });

    const courses = teacherCourses.map((cu) => cu.course);

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching teaching courses:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
