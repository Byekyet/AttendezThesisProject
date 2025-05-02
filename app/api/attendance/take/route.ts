import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Status } from "@prisma/client";

// POST: Submit attendance for multiple students
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only teachers can access this endpoint
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { lectureId, attendanceRecords } = await req.json();

    if (!lectureId || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    // Check if the lecture exists and the teacher is assigned to the course
    const lecture = await prisma.lecture.findUnique({
      where: {
        id: lectureId,
      },
      include: {
        course: true,
      },
    });

    if (!lecture) {
      return NextResponse.json(
        { message: "Lecture not found" },
        { status: 404 }
      );
    }

    // Check if the teacher is assigned to this course
    const courseTeacher = await prisma.courseUser.findFirst({
      where: {
        userId: session.user.id,
        courseId: lecture.courseId,
        role: "TEACHER",
      },
    });

    if (!courseTeacher) {
      return NextResponse.json(
        { message: "You are not assigned to this course" },
        { status: 403 }
      );
    }

    // Create or update attendance records for each student
    const results = await Promise.all(
      attendanceRecords.map(
        async (record: { userId: string; status: Status }) => {
          const { userId, status } = record;

          // Check if the student is enrolled in the course
          const enrollment = await prisma.courseUser.findFirst({
            where: {
              userId: userId,
              courseId: lecture.courseId,
              role: "STUDENT",
            },
          });

          if (!enrollment) {
            return {
              userId,
              success: false,
              message: "Student not enrolled in the course",
            };
          }

          // Create or update the attendance record
          const attendance = await prisma.attendance.upsert({
            where: {
              userId_lectureId: {
                userId: userId,
                lectureId: lectureId,
              },
            },
            update: {
              status: status,
            },
            create: {
              userId: userId,
              lectureId: lectureId,
              status: status,
            },
          });

          return {
            userId,
            success: true,
            attendance,
          };
        }
      )
    );

    return NextResponse.json({
      message: "Attendance records updated successfully",
      results,
    });
  } catch (error) {
    console.error("Error saving attendance records:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
