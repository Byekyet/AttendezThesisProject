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
    const studentId = searchParams.get("studentId");

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this course (either as teacher or student)
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

    // Get all lectures for this course
    const lectures = await prisma.lecture.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        endTime: true,
        type: true,
      },
    });

    // Get all students enrolled in this course
    const courseStudents = await prisma.courseUser.findMany({
      where: {
        courseId: courseId,
        role: "STUDENT",
        // If studentId is provided, filter to just that student
        ...(studentId ? { userId: studentId } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get all attendance records for these lectures and students
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        lectureId: {
          in: lectures.map((lecture) => lecture.id),
        },
        userId: {
          in: courseStudents.map((student) => student.user.id),
        },
      },
    });

    // Format the data for the client
    const formattedData = {
      course: await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, name: true, code: true },
      }),
      lectures: lectures.map((lecture) => ({
        id: lecture.id,
        title: lecture.title,
        date: lecture.date.toISOString().split("T")[0],
        startTime: lecture.startTime
          .toISOString()
          .split("T")[1]
          .substring(0, 5),
        endTime: lecture.endTime.toISOString().split("T")[1].substring(0, 5),
        type: lecture.type,
      })),
      students: courseStudents.map((courseStudent) => {
        const student = courseStudent.user;
        return {
          id: student.id,
          name: student.name,
          email: student.email,
          attendances: lectures.map((lecture) => {
            const attendance = attendanceRecords.find(
              (a) => a.userId === student.id && a.lectureId === lecture.id
            );
            return {
              lectureId: lecture.id,
              status: attendance?.status || "ABSENT",
              date: lecture.date.toISOString().split("T")[0],
            };
          }),
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
