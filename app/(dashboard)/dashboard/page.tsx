import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { authOptions } from "@/lib/auth";

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

    // Different dashboard based on role
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}!</p>
        </div>
        <div className="grid gap-4">
          {user.role === "TEACHER" ? (
            <TeacherDashboard user={user} />
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
