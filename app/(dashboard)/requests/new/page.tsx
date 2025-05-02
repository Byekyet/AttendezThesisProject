"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, CheckIcon } from "lucide-react";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Schedule {
  id: string;
  display: string;
}

interface RequestTypeOption {
  value: string;
  label: string;
}

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [requestType, setRequestType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");

  // Data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Request type options
  const requestTypeOptions: RequestTypeOption[] = [
    { value: "RE_REGISTRATION", label: "Re-register an attendance" },
    { value: "LEAVE", label: "Request for leave" },
    { value: "ABSENCE", label: "Excuse absence" },
    { value: "LATE", label: "Excuse late arrival" },
    { value: "OTHER", label: "Other request" },
  ];

  // Fetch the user's enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses/enrolled");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      } catch (err) {
        setError("Failed to load courses. Please try again.");
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch schedules when a course is selected
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchSchedules = async () => {
      setLoadingData(true);
      try {
        const response = await fetch(
          `/api/courses/${selectedCourseId}/schedules`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }
        const data = await response.json();
        setSchedules(data);
        if (data.length > 0) {
          setSelectedScheduleId(data[0].id);
        }
      } catch (err) {
        setError("Failed to load schedules. Please try again.");
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchSchedules();
  }, [selectedCourseId]);

  // Use mock data if needed
  useEffect(() => {
    if (courses.length === 0 && !loadingData) {
      setCourses([
        { id: "1", name: "Database Management Systems 1", code: "INF 202" },
        { id: "2", name: "Web Development", code: "INF 303" },
      ]);
      setSelectedCourseId("1");
    }
  }, [courses, loadingData]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!requestType) {
      setError("Please select a request type");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a description");
      return;
    }

    if (!selectedCourseId) {
      setError("Please select a course");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: requestType,
          description,
          courseId: selectedCourseId,
          scheduleId: selectedScheduleId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create request");
      }

      // Show success message and reset form
      setRequestType("");
      setDescription("");
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    router.push("/requests");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My requests</h1>
        <div className="flex space-x-2">
          <Link
            href="/requests"
            className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded font-medium hover:bg-gray-50"
          >
            My requests
          </Link>
          <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium">
            Send request
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="request-type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select the request type
            </label>
            <div className="relative">
              <select
                id="request-type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
                disabled={loading}
              >
                <option value="" disabled>
                  Select request type
                </option>
                {requestTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a detailed description of your request"
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="course-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select course
            </label>
            <div className="relative">
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
                disabled={loading || loadingData || courses.length === 0}
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

          <div>
            <label
              htmlFor="schedule-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select course schedule
            </label>
            <div className="relative">
              <select
                id="schedule-select"
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
                disabled={
                  loading ||
                  loadingData ||
                  schedules.length === 0 ||
                  !selectedCourseId
                }
              >
                {schedules.length === 0 ? (
                  <option value="">No schedules available</option>
                ) : (
                  schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.display}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || loadingData}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">
              Successfully sent the request!
            </h2>

            <button
              onClick={handleCloseSuccess}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
