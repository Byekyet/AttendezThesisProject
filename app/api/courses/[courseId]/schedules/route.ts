import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { courseId } = params;

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

    // Fetch all lectures for this course to extract unique schedules
    // In a real app, you might have a separate schedules table
    const lectures = await prisma.lecture.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Extract unique day + time combinations
    const scheduleMap = new Map();

    lectures.forEach((lecture) => {
      const day = new Date(lecture.startTime).toLocaleDateString("en-US", {
        weekday: "long",
      });
      const time = new Date(lecture.startTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const key = `${day}-${time}`;
      if (!scheduleMap.has(key)) {
        scheduleMap.set(key, {
          id: key,
          day,
          time,
          display: `${day} ${time}`,
        });
      }
    });

    // Convert map to array
    const schedules = Array.from(scheduleMap.values());

    // For demo purposes, if no schedules found, return some mock data
    if (schedules.length === 0) {
      return NextResponse.json([
        { id: "1", day: "Monday", time: "09:00", display: "Monday 09:00" },
        {
          id: "2",
          day: "Wednesday",
          time: "14:00",
          display: "Wednesday 14:00",
        },
        { id: "3", day: "Friday", time: "10:30", display: "Friday 10:30" },
      ]);
    }

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching course schedules:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
