"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Attendance, LectureType } from "@prisma/client";
import { AttendanceStatusBadge } from "@/components/attendance/attendance-status-badge";

type ExtendedAttendance = Attendance & {
  lecture: {
    id: string;
    title: string;
    type: LectureType;
    date: string;
    startTime: string;
    endTime: string;
    course: {
      id: string;
      name: string;
      code: string;
    };
  };
};

export default function MyAttendancePage() {
  const { data: session } = useSession();
  const [attendanceRecords, setAttendanceRecords] = useState<
    ExtendedAttendance[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LectureType | "ALL">("ALL");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/attendance");
        if (!response.ok) {
          throw new Error("Failed to fetch attendance records");
        }
        const data = await response.json();
        setAttendanceRecords(data);
      } catch (err: any) {
        setError(
          err.message || "An error occurred while fetching attendance records"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAttendance();
    }
  }, [session]);

  const filteredRecords =
    filter === "ALL"
      ? attendanceRecords
      : attendanceRecords.filter((record) => record.lecture.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">
          View your attendance records across all courses
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              filter === "ALL" ? "bg-blue-100 text-blue-700" : "bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("LECTURE")}
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              filter === "LECTURE" ? "bg-blue-100 text-blue-700" : "bg-gray-100"
            }`}
          >
            Lectures
          </button>
          <button
            onClick={() => setFilter("PRACTICE")}
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              filter === "PRACTICE"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100"
            }`}
          >
            Practice
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading attendance records...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border p-8 text-center">
            <h3 className="text-lg font-medium">No attendance records found</h3>
            <p className="text-gray-500 mt-2">
              {filter === "ALL"
                ? "You have no attendance records yet."
                : `You have no ${filter.toLowerCase()} attendance records.`}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Course
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Session
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.lecture.course.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.lecture.course.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.lecture.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.lecture.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.lecture.startTime).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}{" "}
                      -{" "}
                      {new Date(record.lecture.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.lecture.type === "LECTURE"
                        ? "Lecture"
                        : "Practice"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AttendanceStatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
