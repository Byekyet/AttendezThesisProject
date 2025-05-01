import Link from "next/link";
import { Role } from "@prisma/client";

type RecentAttendanceCardProps = {
  userId: string;
  role: string;
};

export function RecentAttendanceCard({
  userId,
  role,
}: RecentAttendanceCardProps) {
  // This component would typically fetch recent attendance sessions
  // For now, we'll display a placeholder

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">No recent attendance sessions</p>
        {role === "TEACHER" ? (
          <Link
            href="/attendance/take"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Take new attendance
          </Link>
        ) : (
          <Link
            href="/mark"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Mark your attendance
          </Link>
        )}
      </div>
    </div>
  );
}
