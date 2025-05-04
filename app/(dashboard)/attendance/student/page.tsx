"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

interface Lecture {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
}

interface Attendance {
  lectureId: string;
  status: string;
  date: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  attendances: Attendance[];
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface AttendanceData {
  course: Course;
  lectures: Lecture[];
  students: Student[];
}

export default function StudentAttendancePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId");
  const studentId = searchParams.get("studentId");

  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  // Fetch student attendance data
  useEffect(() => {
    if (!courseId || !studentId) {
      setError("Course ID and Student ID are required");
      setLoading(false);
      return;
    }

    const fetchStudentData = async () => {
      setLoading(true);
      try {
        // Add cache-busting timestamp to prevent browser caching
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/attendance/course?courseId=${courseId}&studentId=${studentId}&_t=${timestamp}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch student attendance data");
        }

        const data = await response.json();
        setAttendanceData(data);

        // Find the student
        if (data.students.length > 0) {
          setStudent(data.students[0]);
        } else {
          throw new Error("Student not found");
        }

        setError(null);
      } catch (err) {
        setError("Failed to load student data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [courseId, studentId]);

  // Calculate attendance statistics
  const calculateStats = () => {
    if (!student || !attendanceData) return null;

    const total = student.attendances.length;
    const present = student.attendances.filter(
      (att) => att.status === "PRESENT"
    ).length;
    const late = student.attendances.filter(
      (att) => att.status === "LATE"
    ).length;
    const excused = student.attendances.filter(
      (att) => att.status === "EXCUSED"
    ).length;
    const absent = student.attendances.filter(
      (att) => att.status === "ABSENT"
    ).length;

    const presentPercentage =
      total > 0 ? Math.round((present / total) * 100) : 0;
    const latePercentage = total > 0 ? Math.round((late / total) * 100) : 0;
    const excusedPercentage =
      total > 0 ? Math.round((excused / total) * 100) : 0;
    const absentPercentage = total > 0 ? Math.round((absent / total) * 100) : 0;

    return {
      total,
      present,
      late,
      excused,
      absent,
      presentPercentage,
      latePercentage,
      excusedPercentage,
      absentPercentage,
    };
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800";
      case "LATE":
        return "bg-yellow-100 text-yellow-800";
      case "EXCUSED":
        return "bg-blue-100 text-blue-800";
      case "ABSENT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format lecture type
  const formatLectureType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // Attendance status names
  const statusNames: Record<string, string> = {
    PRESENT: "Present",
    LATE: "Late",
    EXCUSED: "Excused",
    ABSENT: "Absent",
  };

  const stats = calculateStats();

  if (loading) {
    return <div className="p-6 text-center">Loading student data...</div>;
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      </div>
    );
  }

  if (!student || !attendanceData) {
    return (
      <div className="p-6 text-center">
        Student not found or no attendance data available.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Student Attendance</h1>
      </div>

      {/* Student & Course Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Student Information</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-500 text-sm">Name:</span>
                <p className="font-medium">{student.name}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">ID:</span>
                <p className="font-medium">{student.id}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Email:</span>
                <p className="font-medium">{student.email}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Information</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-500 text-sm">Course Name:</span>
                <p className="font-medium">{attendanceData.course.name}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Course Code:</span>
                <p className="font-medium">{attendanceData.course.code}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Total Lectures:</span>
                <p className="font-medium">{stats?.total || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Stats */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Attendance Summary</h2>

          {/* Attendance Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
            <div className="flex h-6 rounded-full overflow-hidden">
              <div
                className="bg-green-500"
                style={{ width: `${stats.presentPercentage}%` }}
                title={`Present: ${stats.presentPercentage}%`}
              ></div>
              <div
                className="bg-yellow-500"
                style={{ width: `${stats.latePercentage}%` }}
                title={`Late: ${stats.latePercentage}%`}
              ></div>
              <div
                className="bg-blue-500"
                style={{ width: `${stats.excusedPercentage}%` }}
                title={`Excused: ${stats.excusedPercentage}%`}
              ></div>
              <div
                className="bg-red-500"
                style={{ width: `${stats.absentPercentage}%` }}
                title={`Absent: ${stats.absentPercentage}%`}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-green-800 font-medium mb-1">Present</h3>
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-green-700">
                  {stats.present}
                </span>
                <span className="text-sm text-green-600">
                  {stats.presentPercentage}%
                </span>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-yellow-800 font-medium mb-1">Late</h3>
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-yellow-700">
                  {stats.late}
                </span>
                <span className="text-sm text-yellow-600">
                  {stats.latePercentage}%
                </span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-blue-800 font-medium mb-1">Excused</h3>
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-blue-700">
                  {stats.excused}
                </span>
                <span className="text-sm text-blue-600">
                  {stats.excusedPercentage}%
                </span>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-red-800 font-medium mb-1">Absent</h3>
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-red-700">
                  {stats.absent}
                </span>
                <span className="text-sm text-red-600">
                  {stats.absentPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Attendance History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {attendanceData.lectures.map((lecture) => {
            const attendance = student.attendances.find(
              (att) => att.lectureId === lecture.id
            );
            const status = attendance?.status || "ABSENT";

            return (
              <div key={lecture.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-wrap items-start justify-between">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-medium text-gray-900">
                      {lecture.title}
                    </h3>
                    <div className="flex flex-wrap items-center mt-1 text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{lecture.date}</span>
                      </div>
                      <div className="flex items-center mr-4">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {lecture.startTime} - {lecture.endTime}
                        </span>
                      </div>
                      <span className="rounded px-2 py-1 text-xs bg-gray-100">
                        {formatLectureType(lecture.type)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                        status
                      )}`}
                    >
                      {statusNames[status] || status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
