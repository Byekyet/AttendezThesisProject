import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "TEACHER") {
      // Get courses where user is a teacher
      const sections = await prisma.courseUser.findMany({
        where: {
          userId: user.id,
          role: "TEACHER",
        },
        include: {
          course: true,
        },
      });

      // Get recent lecture sessions
      const recentSessions = await prisma.lecture.findMany({
        where: {
          takenById: user.id,
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
        include: {
          course: true,
          attendances: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Get pending requests
      const pendingRequests = await prisma.request.findMany({
        where: {
          status: "PENDING",
          courseId: { in: sections.map((section) => section.courseId) },
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
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      // Count total students in teacher's courses
      const totalStudentsResult = await prisma.courseUser.groupBy({
        by: ["userId"],
        where: {
          courseId: {
            in: sections.map((section) => section.courseId),
          },
          role: "STUDENT",
        },
      });

      // Count total lectures in teacher's courses
      const totalLectures = await prisma.lecture.count({
        where: {
          courseId: {
            in: sections.map((section) => section.courseId),
          },
        },
      });

      // Get upcoming lectures (lectures in the future)
      const today = new Date();
      const upcomingLectures = await prisma.lecture.count({
        where: {
          courseId: {
            in: sections.map((section) => section.courseId),
          },
          date: {
            gte: today,
          },
        },
      });

      // Create course summary
      const courseSummary = {
        totalCourses: sections.length,
        totalStudents: totalStudentsResult.length,
        totalLectures: totalLectures,
        upcomingLectures: upcomingLectures,
      };

      // Get additional data for each course
      const enhancedSections = await Promise.all(
        sections.map(async (section) => {
          // Get student count for this course
          const studentCount = await prisma.courseUser.count({
            where: {
              courseId: section.courseId,
              role: "STUDENT",
            },
          });

          // Get most recent lecture for this course
          const lastLecture = await prisma.lecture.findFirst({
            where: {
              courseId: section.courseId,
            },
            orderBy: {
              date: "desc",
            },
            select: {
              id: true,
              title: true,
              date: true,
            },
          });

          return {
            ...section,
            studentCount,
            lastLecture,
          };
        })
      );

      return NextResponse.json({
        user,
        sections: enhancedSections,
        recentSessions,
        pendingRequests,
        courseSummary,
      });
    } else if (user.role === "STUDENT") {
      // Get attendance records for student
      const attendances = await prisma.attendance.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          lecture: {
            date: "desc",
          },
        },
        include: {
          lecture: {
            include: {
              course: true,
            },
          },
        },
      });

      // Get course enrollment details with additional stats
      const coursesWithStats = await Promise.all(
        user.courses.map(async (courseUser) => {
          const courseAttendances = attendances.filter(
            (a) => a.lecture.courseId === courseUser.courseId
          );

          const stats = {
            total: courseAttendances.length,
            present: courseAttendances.filter((a) => a.status === "PRESENT")
              .length,
            absent: courseAttendances.filter((a) => a.status === "ABSENT")
              .length,
            late: courseAttendances.filter((a) => a.status === "LATE").length,
            excused: courseAttendances.filter((a) => a.status === "EXCUSED")
              .length,
          };

          // Get upcoming lectures for this course
          const today = new Date();
          const upcomingLectures = await prisma.lecture.findMany({
            where: {
              courseId: courseUser.courseId,
              date: {
                gte: today,
              },
            },
            orderBy: {
              date: "asc",
            },
            take: 1,
          });

          return {
            ...courseUser,
            stats,
            nextLecture: upcomingLectures[0] || null,
          };
        })
      );

      // Create course summary for student
      const courseSummary = {
        totalCourses: user.courses.length,
        upcomingLectures: await prisma.lecture.count({
          where: {
            courseId: { in: user.courses.map((c) => c.courseId) },
            date: { gte: new Date() },
          },
        }),
      };

      return NextResponse.json({
        user,
        attendances,
        courses: coursesWithStats,
        courseSummary,
      });
    } else {
      return NextResponse.json({
        user,
      });
    }
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
