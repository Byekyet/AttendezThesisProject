"use client";

import Link from "next/link";
import { CheckIcon } from "lucide-react";

export default function MarkAttendanceSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-8">
          Successfully marked the attendance!
        </h2>

        <Link
          href="/dashboard"
          className="block w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
