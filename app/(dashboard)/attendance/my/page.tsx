"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";

type Course = {
  id: string;
  name: string;
  code: string;
};

type AttendanceRecord = {
  id: string;
  status: string;
  date: string;
  hour: string;
  classroom: string;
};

type Statistics = {
  attended: number;
  missed: number;
  notSubmitted: number;
  total: number;
};

export default function MyAttendancePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [terms] = useState<string[]>(["Spring", "Summer", "Fall", "Winter"]);
  const [selectedTerm, setSelectedTerm] = useState<string>("Spring");

  // Display states
  const [activeTab, setActiveTab] = useState<"LECTURE" | "PRACTICE">("LECTURE");
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [statistics, setStatistics] = useState<Statistics>({
    attended: 0,
    missed: 0,
    notSubmitted: 0,
    total: 0,
  });

  // Generate years (current year and 5 years back)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let i = 0; i < 6; i++) {
      yearList.push((currentYear - i).toString());
    }
    setYears(yearList);
  }, []);

  // Fetch courses when session is available
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses/my");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0]);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching courses");
      }
    };

    if (session) {
      fetchCourses();
    }
  }, [session]);

  // Fetch attendance data when filters change
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedCourse) return;

      setLoading(true);
      try {
        const url = `/api/attendance/my?courseId=${selectedCourse.id}&year=${selectedYear}&term=${selectedTerm}&type=${activeTab}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch attendance data");
        }

        const data = await response.json();
        setAttendanceRecords(data.attendanceRecords || []);
        setStatistics(data.statistics);
      } catch (err: any) {
        setError(
          err.message || "An error occurred while fetching attendance data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (selectedCourse) {
      fetchAttendanceData();
    }
  }, [selectedCourse, selectedYear, selectedTerm, activeTab]);

  // Prepare chart data
  const chartData = [
    { name: "Attended", value: statistics.attended, color: "#4A8FF7" },
    { name: "Missed", value: statistics.missed, color: "#FF87C2" },
    { name: "Not submitted", value: statistics.notSubmitted, color: "#E5E7EB" },
  ];

  // Handle view button click
  const handleViewClick = () => {
    if (selectedCourse) {
      const fetchAttendanceData = async () => {
        setLoading(true);
        try {
          const url = `/api/attendance/my?courseId=${selectedCourse.id}&year=${selectedYear}&term=${selectedTerm}&type=${activeTab}`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error("Failed to fetch attendance data");
          }

          const data = await response.json();
          setAttendanceRecords(data.attendanceRecords || []);
          setStatistics(data.statistics);
        } catch (err: any) {
          setError(
            err.message || "An error occurred while fetching attendance data"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchAttendanceData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My attendance</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Select year</label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full py-2 pl-3 pr-10 border border-gray-300 bg-white rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Select term</label>
          <div className="relative">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full py-2 pl-3 pr-10 border border-gray-300 bg-white rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {terms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[300px]">
          <label className="block text-sm font-medium mb-1">
            Select course
          </label>
          <div className="relative">
            <select
              value={selectedCourse?.id || ""}
              onChange={(e) => {
                const course = courses.find((c) => c.id === e.target.value);
                setSelectedCourse(course || null);
              }}
              className="w-full py-2 pl-3 pr-10 border border-gray-300 bg-white rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code}: {course.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleViewClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <div className="flex -mb-px">
            <button
              onClick={() => setActiveTab("LECTURE")}
              className={`py-2 px-4 text-center ${
                activeTab === "LECTURE"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Lecture
            </button>
            <button
              onClick={() => setActiveTab("PRACTICE")}
              className={`py-2 px-4 text-center ${
                activeTab === "PRACTICE"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Practice
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Table */}
          <div className="lg:col-span-2 border rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clasroom
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record, index) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.hour}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.status === "PRESENT" ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-600 p-1.5">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        ) : record.status === "ABSENT" ? (
                          <span className="inline-flex items-center rounded-full bg-pink-100 text-pink-600 p-1.5">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 p-1.5">
                            <svg
                              className="h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.classroom || "CROOM101"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Statistics */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex justify-between items-center">
              <span>Statistics</span>
              <span className="text-xl">⋮</span>
            </h3>

            <div className="space-y-2 mb-6">
              <div className="flex items-center p-2 bg-blue-100 rounded-md text-blue-700">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-500 text-white p-1 mr-2">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span>Attended: {statistics.attended}</span>
              </div>

              <div className="flex items-center p-2 bg-pink-100 rounded-md text-pink-700">
                <span className="inline-flex items-center justify-center rounded-full bg-pink-500 text-white p-1 mr-2">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span>Missed: {statistics.missed}</span>
              </div>

              <div className="flex items-center p-2 bg-gray-100 rounded-md text-gray-700">
                <span className="inline-flex items-center justify-center rounded-full bg-gray-400 text-white p-1 mr-2">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span>Not submitted: {statistics.notSubmitted}</span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={0}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm">
                <span className="h-3 w-3 bg-blue-500 rounded-full mr-2"></span>
                <span>Present</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="h-3 w-3 bg-pink-500 rounded-full mr-2"></span>
                <span>Absent</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="h-3 w-3 bg-gray-300 rounded-full mr-2"></span>
                <span>Not submitted</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
