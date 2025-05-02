import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Schedule {
  id: string;
  day: string;
  time: string;
  display: string;
}

interface CourseSelectionProps {
  onCourseSelect: (courseId: string) => void;
  onScheduleSelect: (scheduleId: string) => void;
  selectedCourseId?: string;
  selectedScheduleId?: string;
}

export function CourseSelection({
  onCourseSelect,
  onScheduleSelect,
  selectedCourseId,
  selectedScheduleId,
}: CourseSelectionProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses/enrolled");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data);
        if (data.length > 0 && !selectedCourseId) {
          onCourseSelect(data[0].id);
        }
      } catch (err) {
        setError("Failed to load courses. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [onCourseSelect, selectedCourseId]);

  // Fetch schedules for selected course
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/courses/${selectedCourseId}/schedules`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch schedules");
        }
        const data = await response.json();
        setSchedules(data);
        if (data.length > 0 && !selectedScheduleId) {
          onScheduleSelect(data[0].id);
        }
      } catch (err) {
        setError("Failed to load schedules. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [selectedCourseId, onScheduleSelect, selectedScheduleId]);

  // For demo purposes, adding mock data
  useEffect(() => {
    if (courses.length === 0 && !loading) {
      setCourses([
        { id: "1", name: "Database Management Systems", code: "INF 202" },
        { id: "2", name: "Web Development", code: "INF 303" },
        { id: "3", name: "Data Structures", code: "INF 101" },
      ]);
      if (!selectedCourseId) {
        onCourseSelect("1");
      }
    }

    if (selectedCourseId && schedules.length === 0 && !loading) {
      setSchedules([
        { id: "1", day: "Monday", time: "09:00", display: "Monday 09:00" },
        {
          id: "2",
          day: "Wednesday",
          time: "14:00",
          display: "Wednesday 14:00",
        },
        { id: "3", day: "Friday", time: "10:30", display: "Friday 10:30" },
      ]);
      if (!selectedScheduleId) {
        onScheduleSelect("1");
      }
    }
  }, [
    courses,
    schedules,
    loading,
    selectedCourseId,
    selectedScheduleId,
    onCourseSelect,
    onScheduleSelect,
  ]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
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
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
              value={selectedCourseId}
              onChange={(e) => onCourseSelect(e.target.value)}
              disabled={loading || courses.length === 0}
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
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
              value={selectedScheduleId}
              onChange={(e) => onScheduleSelect(e.target.value)}
              disabled={loading || schedules.length === 0 || !selectedCourseId}
            >
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.display}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
