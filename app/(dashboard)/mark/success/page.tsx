"use client";

import Link from "next/link";

export default function MarkAttendanceSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-600"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 className="mb-2 text-2xl font-bold">
        Attendance Marked Successfully!
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Your attendance has been recorded for this session.
      </p>
      <div className="space-x-4">
        <Link
          href="/attendance/my"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View My Attendance
        </Link>
        <Link
          href="/dashboard"
          className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
