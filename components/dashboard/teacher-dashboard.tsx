import Link from "next/link";
import { CourseCard } from "./course-card";
import { RecentAttendanceCard } from "./recent-attendance-card";

type TeacherDashboardProps = {
  user: any; // Replace with proper type
};

export function TeacherDashboard({ user }: TeacherDashboardProps) {
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
                  You don't have any courses yet
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
          <h2 className="text-xl font-semibold">Recent Attendance Sessions</h2>
          <Link
            href="/attendance/take"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Take attendance
          </Link>
        </div>
        <div className="grid gap-4">
          <RecentAttendanceCard userId={user.id} role={user.role} />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Pending Requests</h2>
          <Link
            href="/request"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">
              No pending requests at the moment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
