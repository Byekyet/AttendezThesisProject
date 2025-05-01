import Link from "next/link";
import { CourseCard } from "./course-card";
import { RecentAttendanceCard } from "./recent-attendance-card";
type StudentDashboardProps = {
  user: any; // Replace with proper type
};

export function StudentDashboard({ user }: StudentDashboardProps) {
  const courses = user.courses.map((cu: any) => cu.course);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Courses</h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.length > 0 ? (
            courses
              .slice(0, 3)
              .map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))
          ) : (
            <div className="col-span-3 flex h-40 items-center justify-center rounded-lg border border-dashed">
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-gray-500">
                  You are not enrolled in any courses yet
                </p>
                <Link
                  href="/courses"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Browse available courses
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Attendance</h2>
          <Link
            href="/attendance/my"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-4">
          <RecentAttendanceCard userId={user.id} role={user.role} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Mark Your Attendance</h3>
            <p className="text-sm text-gray-500">
              Use OTP verification to mark your attendance for current sessions.
            </p>
            <Link
              href="/mark"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Mark Attendance
            </Link>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Request Management</h3>
            <p className="text-sm text-gray-500">
              Submit requests for late arrivals or absences.
            </p>
            <Link
              href="/request/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Request
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
