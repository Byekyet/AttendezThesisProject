import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let courses = [];

    if (session.user.role === "TEACHER") {
      // Get courses the teacher is assigned to
      const teacherCourses = await prisma.courseUser.findMany({
        where: {
          userId: session.user.id,
          role: "TEACHER",
        },
        include: {
          course: true,
        },
      });
      courses = teacherCourses.map((cu) => cu.course);
    } else {
      // Get courses the student is enrolled in
      const studentCourses = await prisma.courseUser.findMany({
        where: {
          userId: session.user.id,
          role: "STUDENT",
        },
        include: {
          course: true,
        },
      });
      courses = studentCourses.map((cu) => cu.course);
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
