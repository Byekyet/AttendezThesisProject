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

    const searchParams = new URL(req.url).searchParams;
    const courseId = searchParams.get("courseId");
    const year = searchParams.get("year");
    const term = searchParams.get("term");
    const lectureType = searchParams.get("type");

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this course
    const courseUser = await prisma.courseUser.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
    });

    if (!courseUser) {
      return NextResponse.json(
        { message: "You don't have access to this course" },
        { status: 403 }
      );
    }

    // Build the query for lectures
    const lectureQuery: any = {
      courseId: courseId,
    };

    // Add year filter if provided
    if (year) {
      // Filter lectures by year
      lectureQuery.date = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    // Add term filter if provided
    if (term) {
      // Assuming terms are Spring, Summer, Fall, Winter
      const termDates: Record<string, { start: string; end: string }> = {
        Spring: { start: "01-01", end: "05-31" },
        Summer: { start: "06-01", end: "08-31" },
        Fall: { start: "09-01", end: "12-31" },
        Winter: { start: "12-01", end: "12-31" },
      };

      const yearToUse = year || new Date().getFullYear().toString();

      if (termDates[term]) {
        lectureQuery.date = {
          gte: new Date(`${yearToUse}-${termDates[term].start}`),
          lte: new Date(`${yearToUse}-${termDates[term].end}`),
        };
      }
    }

    // Add lecture type filter if provided
    if (
      lectureType &&
      (lectureType === "LECTURE" || lectureType === "PRACTICE")
    ) {
      lectureQuery.type = lectureType;
    }

    // Get all lectures for this course with the applied filters
    const lectures = await prisma.lecture.findMany({
      where: lectureQuery,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Get all attendance records for these lectures for the current user
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        lectureId: {
          in: lectures.map((lecture) => lecture.id),
        },
        userId: session.user.id,
      },
      include: {
        lecture: true,
      },
    });

    // Calculate statistics
    const attended = attendanceRecords.filter(
      (record) => record.status === "PRESENT"
    ).length;
    const missed = attendanceRecords.filter(
      (record) => record.status === "ABSENT"
    ).length;
    const notSubmitted = lectures.length - attendanceRecords.length;

    // Format the data for the client
    const formattedData = {
      course: await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, name: true, code: true },
      }),
      statistics: {
        attended,
        missed,
        notSubmitted,
        total: lectures.length,
      },
      attendanceRecords: attendanceRecords.map((record) => ({
        id: record.id,
        status: record.status,
        date: record.lecture.date.toISOString().split("T")[0],
        hour: record.lecture.startTime
          .toISOString()
          .split("T")[1]
          .substring(0, 5),
        lectureId: record.lecture.id,
        lectureTitle: record.lecture.title,
        lectureType: record.lecture.type,
        clasroom: "CROOM101", // This would ideally come from the database
      })),
      lectures: lectures.map((lecture) => {
        const attendance = attendanceRecords.find(
          (a) => a.lectureId === lecture.id
        );
        return {
          id: lecture.id,
          date: lecture.date.toISOString().split("T")[0],
          hour: lecture.startTime.toISOString().split("T")[1].substring(0, 5),
          status: attendance?.status || "NOT_SUBMITTED",
          classroom: "CROOM101", // This would ideally come from the database
          title: lecture.title,
          type: lecture.type,
        };
      }),
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
