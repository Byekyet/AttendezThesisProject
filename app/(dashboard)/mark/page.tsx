"use client";

import { useState, useCallback } from "react";
import { CourseSelection } from "@/components/attendance/course-selection";
import { OTPVerification } from "@/components/attendance/otp-verification";
import { SuccessModal } from "@/components/attendance/success-modal";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function MarkAttendancePage() {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string>();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>();
  const [showVerification, setShowVerification] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lectureInfo, setLectureInfo] = useState<{
    title: string;
    course: string;
  } | null>(null);

  const handleCourseSelect = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedScheduleId(undefined);
    setError(null);
  }, []);

  const handleScheduleSelect = useCallback((scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    setError(null);
  }, []);

  const handleMarkAttendance = async () => {
    if (!selectedCourseId || !selectedScheduleId) {
      setError("Please select both a course and schedule");
      return;
    }

    setError(null);

    // Extract course and schedule info for display
    try {
      // Get course name from CourseSelection component state (simplified)
      const courseElement = document.getElementById("course-select");
      const courseName = courseElement
        ? (courseElement as HTMLSelectElement).selectedOptions[0].text
        : "Selected Course";

      // Get schedule info
      const scheduleElement = document.getElementById("schedule-select");
      const scheduleName = scheduleElement
        ? (scheduleElement as HTMLSelectElement).selectedOptions[0].text
        : selectedScheduleId;

      setLectureInfo({
        title: scheduleName,
        course: courseName,
      });

      // Show OTP verification modal immediately
      setShowVerification(true);
    } catch (err: any) {
      console.error("Error preparing attendance:", err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  const handleVerify = async (data: any) => {
    if (!selectedCourseId || !selectedScheduleId) {
      setError("Course or schedule information is missing");
      return;
    }

    // Show success modal on successful verification
    toast.success("Attendance marked successfully!");
    setShowVerification(false);
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-sm">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Mark my attendance
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg">
        <CourseSelection
          onCourseSelect={handleCourseSelect}
          onScheduleSelect={handleScheduleSelect}
          selectedCourseId={selectedCourseId}
          selectedScheduleId={selectedScheduleId}
        />

        <div className="mt-6">
          <button
            onClick={handleMarkAttendance}
            disabled={loading || !selectedCourseId || !selectedScheduleId}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Proceed to verification"}
          </button>
        </div>
      </div>

      {showVerification && (
        <OTPVerification
          onSuccess={handleVerify}
          onClose={() => setShowVerification(false)}
          courseId={selectedCourseId!}
          scheduleId={selectedScheduleId}
          lectureInfo={lectureInfo}
        />
      )}

      {showSuccess && <SuccessModal onClose={handleCloseSuccess} />}
    </div>
  );
}
