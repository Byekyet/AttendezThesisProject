import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const scheduleId = searchParams.get("scheduleId");

    if (!courseId || !scheduleId) {
      return NextResponse.json(
        { message: "Course ID and Schedule ID are required" },
        { status: 400 }
      );
    }

    // Check if the user is enrolled in this course
    const enrollment = await prisma.courseUser.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // For demo purposes, assume there's an active lecture
    // In a real implementation, you would check if there's an active lecture for the course and schedule
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();

    const activeLecture = await prisma.lecture.findFirst({
      where: {
        courseId: courseId,
        date: {
          equals: today,
        },
        startTime: {
          lte: now,
        },
        endTime: {
          gte: now,
        },
      },
      include: {
        course: true,
      },
    });

    if (!activeLecture) {
      return NextResponse.json(
        { message: "No active lecture found for this course and schedule" },
        { status: 404 }
      );
    }

    // Check if attendance is already marked
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_lectureId: {
          userId: userId,
          lectureId: activeLecture.id,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { message: "Attendance already marked for this session" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: "Active lecture found, proceed with verification",
      lecture: {
        id: activeLecture.id,
        title: activeLecture.title,
        course: activeLecture.course.name,
        verifyType: activeLecture.verifyType,
      },
    });
  } catch (error) {
    console.error("Error checking lecture status:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
