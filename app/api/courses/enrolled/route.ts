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

    const userId = session.user.id;

    const enrolledCourses = await prisma.courseUser.findMany({
      where: {
        userId: userId,
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

    // Transform the data to the expected format
    const courses = enrolledCourses.map((enrollment) => ({
      id: enrollment.courseId,
      name: enrollment.course.name,
      code: enrollment.course.code,
      role: enrollment.role,
    }));

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
