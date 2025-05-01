"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkAttendancePage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate OTP
    if (!otp.trim()) {
      setError("Please enter an OTP code");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/attendance/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      // Redirect to success page
      router.push("/mark/success");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mark Attendance</h1>
        <p className="text-muted-foreground">
          Enter the OTP code provided by your teacher to mark your attendance
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="max-w-md">
        <div className="rounded-lg border p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">OTP Verification</h3>
            <p className="text-sm text-gray-500">
              Enter the 6-digit OTP code shared by your teacher to mark your
              attendance for the current session.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="text-sm font-medium text-gray-700"
              >
                OTP Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
