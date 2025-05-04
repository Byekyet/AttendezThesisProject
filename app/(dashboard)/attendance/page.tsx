"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Download, Filter, ChevronDown, ArrowUpDown, Info } from "lucide-react";

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

export default function AttendancePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("courseId");

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courseIdParam || ""
  );
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const isTeacher = session?.user?.role === "TEACHER";

  // Fetch courses the user has access to
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Use the dedicated endpoints we've created
        const endpoint = isTeacher
          ? "/api/courses/teaching"
          : "/api/courses/enrolled";
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);

        // Select the first course if none is selected yet
        if (!selectedCourseId && data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      } catch (err) {
        setError("Failed to load courses. Please try again.");
        console.error(err);
      }
    };

    fetchCourses();
  }, [isTeacher, selectedCourseId]);

  // Fetch attendance data when course is selected
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        // Add cache-busting timestamp to prevent browser caching
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/attendance/course?courseId=${selectedCourseId}&_t=${timestamp}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }

        const data = await response.json();
        setAttendanceData(data);
        setError(null);
      } catch (err) {
        setError("Failed to load attendance data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();

    // Update URL with selected course
    router.push(`/attendance?courseId=${selectedCourseId}`, { scroll: false });
  }, [selectedCourseId, router]);

  // Get status class for attendance
  const getStatusClass = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-500 text-white";
      case "LATE":
        return "bg-yellow-500 text-white";
      case "EXCUSED":
        return "bg-blue-500 text-white";
      case "ABSENT":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200";
    }
  };

  // Get icon for attendance
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <span className="text-xs">✓</span>;
      case "LATE":
        return <span className="text-xs">⟳</span>;
      case "EXCUSED":
        return <span className="text-xs">E</span>;
      case "ABSENT":
        return <span className="text-xs">✗</span>;
      default:
        return <span className="text-xs">-</span>;
    }
  };

  // Get lecture label from title
  const getLectureLabel = (lecture: Lecture) => {
    // Direct approach with original format
    if (lecture.title.includes("Week")) {
      const match = lecture.title.match(/Week\s+(\d+)/i);
      if (match) {
        const weekNum = match[1];
        return lecture.type === "LECTURE"
          ? `Lecture ${weekNum}`
          : `Practice ${weekNum}`;
      }
    }

    // Try to match new format "Lecture X: CODE"
    const titleMatch = lecture.title.match(
      /^(Lecture|Practice)\s+(\d+)(?::|$)/i
    );
    if (titleMatch) {
      const type = titleMatch[1]; // "Lecture" or "Practice"
      const number = titleMatch[2];
      return `${type} ${number}`;
    }

    // Handle Monday 09:00 format lectures
    if (lecture.title.includes("09:00") || lecture.title.includes("14:00")) {
      return lecture.type === "LECTURE" ? "Lecture 1" : "Practice 1";
    }

    // Last fallback
    const date = new Date(lecture.date);
    const weekNumber = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
    return lecture.type === "LECTURE"
      ? `Lecture ${weekNumber}`
      : `Practice ${weekNumber}`;
  };

  // Handle course selection
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(e.target.value);
  };

  // Filter students based on search term
  const filteredStudents =
    attendanceData?.students.filter((student) => {
      const nameMatch = student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (statusFilter) {
        // Check if student has any attendance with the selected status
        const hasStatusMatch = student.attendances.some(
          (att) => att.status === statusFilter
        );
        return nameMatch && hasStatusMatch;
      }

      return nameMatch;
    }) || [];

  // Download attendance as CSV
  const downloadAttendance = () => {
    if (!attendanceData) return;

    // Create CSV header
    let csvContent = "Student ID,Student Name,";

    // Add lecture titles to header
    attendanceData.lectures.forEach((lecture) => {
      csvContent += `${getLectureLabel(lecture)} (${lecture.date}),`;
    });
    csvContent += "\n";

    // Add student data
    attendanceData.students.forEach((student) => {
      csvContent += `${student.id},${student.name},`;

      // Add attendance status for each lecture
      attendanceData.lectures.forEach((lecture) => {
        const attendance = student.attendances.find(
          (att) => att.lectureId === lecture.id
        );
        csvContent += `${attendance?.status || "ABSENT"},`;
      });
      csvContent += "\n";
    });

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `attendance_${attendanceData.course.code}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View student details
  const viewStudentDetails = (studentId: string) => {
    router.push(
      `/attendance/student?courseId=${selectedCourseId}&studentId=${studentId}`
    );
  };

  if (courses.length === 0 && !loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">You are not enrolled in any courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-6 pt-6 mb-6">
        <h1 className="text-2xl font-bold">Attendance List</h1>
        <div className="flex space-x-4">
          {/* Course Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="course-select" className="text-sm font-medium">
              Course:
            </label>
            <div className="relative">
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={handleCourseChange}
                className="pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
                disabled={loading}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={downloadAttendance}
            disabled={!attendanceData || loading}
            className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mb-6 bg-red-100 border border-red-400 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mx-6 mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Student
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name"
            />
          </div>
          <div>
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Status
            </label>
            <div className="relative">
              <select
                id="status-filter"
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="EXCUSED">Excused</option>
                <option value="ABSENT">Absent</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <Filter className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mx-6 text-center py-12 bg-white rounded-lg shadow flex-grow">
          <p className="text-gray-500">Loading attendance data...</p>
        </div>
      ) : attendanceData ? (
        <div className="mx-6 pb-6 flex-grow flex flex-col">
          <div className="bg-white rounded-lg shadow overflow-hidden flex-grow">
            <div className="overflow-auto h-full">
              <table className="border-separate border-spacing-0 table-fixed">
                <thead className="sticky top-0 z-20">
                  <tr>
                    <th
                      className="sticky left-0 z-30 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 border-b"
                      style={{ width: "200px" }}
                    >
                      <div className="flex items-center">
                        <span>Student Name</span>
                        <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </th>
                    {attendanceData.lectures.map((lecture) => (
                      <th
                        key={lecture.id}
                        className="px-2 py-3 text-xs font-medium text-gray-700 text-center border-b bg-gray-50 relative group"
                        style={{ width: "120px", minWidth: "120px" }}
                      >
                        <div className="flex flex-col items-center">
                          <span>{getLectureLabel(lecture)}</span>
                          <div className="hidden group-hover:block absolute z-50 bg-white shadow-md rounded-md p-3 w-64 -left-16 top-full mt-1 text-left border border-gray-200">
                            <div className="text-sm">
                              <p className="font-semibold mb-1 text-blue-700">
                                {lecture.title}
                              </p>
                              <p className="text-gray-700 mb-1">
                                <span className="font-medium">Date:</span>{" "}
                                {new Date(lecture.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                              <p className="text-gray-700">
                                <span className="font-medium">Time:</span>{" "}
                                {lecture.startTime} - {lecture.endTime}
                              </p>
                            </div>
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45"></div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => viewStudentDetails(student.id)}
                    >
                      <td
                        className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium border-b"
                        style={{ width: "200px" }}
                      >
                        {student.name}
                      </td>
                      {attendanceData.lectures.map((lecture) => {
                        const attendance = student.attendances.find(
                          (att) => att.lectureId === lecture.id
                        );
                        const status = attendance?.status || "ABSENT";
                        return (
                          <td
                            key={lecture.id}
                            className="px-1 py-3 text-center border-b"
                          >
                            <div
                              className={`mx-auto w-6 h-6 rounded-full flex items-center justify-center ${getStatusClass(
                                status
                              )}`}
                            >
                              {getStatusIcon(status)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">Late</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">Excused</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Absent</span>
                </div>
                <div className="flex items-center ml-auto">
                  <Info className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Click on a student row to view details
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No attendance data available.</p>
        </div>
      )}
    </div>
  );
}
