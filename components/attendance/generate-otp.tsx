import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "react-hot-toast";

interface GenerateOTPProps {
  courseId: string;
  lectureId: string;
  onSuccess?: (otp: string) => void;
}

export function GenerateOTP({
  courseId,
  lectureId,
  onSuccess,
}: GenerateOTPProps) {
  const [otp, setOTP] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/attendance/generate-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          lectureId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate OTP");
      }

      setOTP(data.otp);
      setExpiresAt(new Date(data.expiresAt));

      if (onSuccess) {
        onSuccess(data.otp);
      }

      // Copy to clipboard
      navigator.clipboard.writeText(data.otp).then(
        () => {
          toast.success("OTP copied to clipboard");
        },
        (err) => {
          console.error("Could not copy OTP: ", err);
        }
      );
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      toast.error(err.message || "Failed to generate OTP");
    } finally {
      setLoading(false);
    }
  };

  // Format time remaining
  const getTimeRemaining = () => {
    if (!expiresAt) return "";

    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const seconds = Math.floor(diff / 1000);
    return `${seconds} seconds`;
  };

  return (
    <Card className="p-4 bg-white shadow-sm border border-gray-200">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Attendance OTP Code</h3>
          <Button
            onClick={generateOTP}
            disabled={loading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Generating..." : "Generate New OTP"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {otp && (
          <div className="mt-4 space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-6 gap-2">
                {otp.split("").map((digit, i) => (
                  <div
                    key={i}
                    className="w-10 h-12 flex items-center justify-center bg-white border border-gray-300 rounded-md text-xl font-bold text-gray-900"
                  >
                    {digit}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500 flex justify-between items-center">
              <div>
                Expires in:{" "}
                <span className="font-medium">{getTimeRemaining()}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(otp);
                  toast.success("OTP copied to clipboard");
                }}
              >
                Copy
              </Button>
            </div>

            <div className="text-sm text-gray-500 mt-2">
              Share this code with students to mark their attendance
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
