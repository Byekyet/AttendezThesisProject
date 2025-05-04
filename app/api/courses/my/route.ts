import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get all courses the user is enrolled in
    const userCourses = await prisma.courseUser.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        course: true,
      },
      orderBy: {
        course: {
          name: "asc",
        },
      },
    });

    const courses = userCourses.map((userCourse) => ({
      id: userCourse.course.id,
      name: userCourse.course.name,
      code: userCourse.course.code,
      role: userCourse.role,
    }));

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching user courses:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
