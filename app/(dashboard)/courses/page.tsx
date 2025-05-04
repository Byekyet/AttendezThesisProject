"use client";

import { useSession } from "next-auth/react";

export default function CourseManagementPage() {
  const { data: session } = useSession();

  if (!session?.user || session.user.role !== "TEACHER") {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg text-red-500">
          Access denied. This page is for teachers only.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <h1 className="text-2xl font-bold mb-4">Course Management</h1>
      <div className="p-3 mb-5 rounded-full bg-amber-100 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <h2 className="text-xl text-gray-700 font-medium mb-2">
        Under Development
      </h2>
      <p className="text-gray-500 text-center max-w-md">
        The Course Management feature is currently being developed. Check back
        soon!
      </p>
    </div>
  );
}
