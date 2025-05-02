"use client";

import { useState, useCallback } from "react";
import { CourseSelection } from "@/components/attendance/course-selection";
import { OTPVerification } from "@/components/attendance/otp-verification";
import { SuccessModal } from "@/components/attendance/success-modal";
import { useRouter } from "next/navigation";

export default function MarkAttendancePage() {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string>();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>();
  const [showVerification, setShowVerification] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCourseSelect = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedScheduleId(undefined);
  }, []);

  const handleScheduleSelect = useCallback((scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
  }, []);

  const handleMarkAttendance = async () => {
    if (!selectedCourseId || !selectedScheduleId) {
      setError("Please select both a course and schedule");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Check if there's an active lecture for this course and schedule
      const response = await fetch(
        `/api/attendance/check?courseId=${selectedCourseId}&scheduleId=${selectedScheduleId}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to check attendance status");
      }

      // If we get here, we should show the verification dialog
      setShowVerification(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (otp: string) => {
    setError(null);

    try {
      const response = await fetch("/api/attendance/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp,
          courseId: selectedCourseId,
          scheduleId: selectedScheduleId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      // Show success modal on successful verification
      setShowVerification(false);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
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
            {loading ? "Checking..." : "Mark attendance"}
          </button>
        </div>
      </div>

      {showVerification && (
        <OTPVerification
          onVerify={handleVerify}
          onClose={() => setShowVerification(false)}
          error={error}
        />
      )}

      {showSuccess && <SuccessModal onClose={handleCloseSuccess} />}
    </div>
  );
}
