import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Authentication is already handled by layout
  if (!session || !session.user || !session.user.id) {
    return redirect("/login");
  }

  try {
    // Get user data with enrollments
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
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-xl font-bold">User not found</h2>
          <p className="text-muted-foreground">
            There was a problem loading your data. Please try logging in again.
          </p>
        </div>
      );
    }

    // Fetch additional data for teacher dashboard
    let teacherData = null;
    if (user.role === "TEACHER") {
      // Get sections (course-user combinations where the teacher is assigned)
      const sections = await prisma.courseUser.findMany({
        where: {
          userId: user.id,
          role: "TEACHER",
        },
        include: {
          course: {
            include: {
              users: {
                where: {
                  role: "STUDENT",
                },
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
          },
        },
      });

      // Get recent attendance sessions
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

      // Get pending requests that need teacher's attention
      const pendingRequests = await prisma.request.findMany({
        where: {
          status: "PENDING",
          // Filter by requests related to lectures taught by this teacher
          // Using the lecture ID rather than a direct relation
          lectureId: {
            in: await prisma.lecture
              .findMany({
                where: { takenById: user.id },
                select: { id: true },
              })
              .then((lectures) => lectures.map((l) => l.id)),
          },
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
        take: 5,
      });

      teacherData = {
        sections,
        recentSessions,
        pendingRequests,
      };
    }

    // Different dashboard based on role
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          {user.role === "TEACHER" && (
            <Link href="/attendance/take">
              <Button variant="outline" size="sm">
                Take Attendance
              </Button>
            </Link>
          )}
        </div>
        <div>
          {user.role === "TEACHER" ? (
            <TeacherDashboard
              user={user}
              additionalData={
                teacherData
                  ? {
                      sections: teacherData.sections,
                      recentSessions: teacherData.recentSessions,
                      pendingRequests: teacherData.pendingRequests,
                    }
                  : null
              }
            />
          ) : (
            <StudentDashboard user={user} />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">
          There was a problem loading your dashboard. Please try again later.
        </p>
      </div>
    );
  }
}
