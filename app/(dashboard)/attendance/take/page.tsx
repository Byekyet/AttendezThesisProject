"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Course } from "@prisma/client";

const methods = [
  {
    id: "manual",
    label: "Manual",
    description: "Mark attendance manually for each student",
  },
  {
    id: "otp",
    label: "OTP-Based",
    description: "Generate an OTP code for students to verify",
  },
];

export default function TakeAttendancePage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching courses");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchCourses();
    }
  }, [session]);

  const handleMethodChange = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
  };

  if (!session || session.user.role !== "TEACHER") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unauthorized</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Take Attendance</h1>
        <p className="text-muted-foreground">
          Select a method and course to take attendance
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="rounded-lg border p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">1. Select Attendance Method</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {methods.map((method) => (
              <div
                key={method.id}
                className={`cursor-pointer rounded-lg border p-4 ${
                  selectedMethod === method.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                }`}
                onClick={() => handleMethodChange(method.id)}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      selectedMethod === method.id
                        ? "bg-blue-500"
                        : "border border-gray-300"
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="font-medium">{method.label}</span>
                </div>
                <p className="mt-2 pl-7 text-sm text-gray-500">
                  {method.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">2. Select Course</h3>
          <div className="space-y-4">
            {loading ? (
              <p>Loading courses...</p>
            ) : courses.length === 0 ? (
              <p>No courses found</p>
            ) : (
              <select
                id="course"
                name="course"
                value={selectedCourse || ""}
                onChange={handleCourseChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!selectedMethod || !selectedCourse}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={() => {
              const route =
                selectedMethod === "manual"
                  ? `/attendance/take/manual/${selectedCourse}`
                  : `/attendance/take/otp/${selectedCourse}`;
              window.location.href = route;
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
