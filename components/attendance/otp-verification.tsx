import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface OTPVerificationProps {
  onClose: () => void;
  onSuccess: (data: any) => void;
  courseId: string;
  lectureId?: string;
  scheduleId?: string;
  lectureInfo?: { title: string; course: string } | null;
}

export function OTPVerification({
  onClose,
  onSuccess,
  courseId,
  lectureId,
  scheduleId,
  lectureInfo,
}: OTPVerificationProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  // Function to handle ref assignments
  const setRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  // Focus management and digit handling
  const handleDigitChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    // Update the digits array
    const newDigits = [...digits];
    newDigits[index] = value.slice(0, 1); // Take only first character
    setDigits(newDigits);

    // If value is entered and not the last input, focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // If backspace is pressed and current field is empty, focus previous field
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Only process if it looks like a numeric code
    if (!/^\d+$/.test(pastedData)) return;

    // Fill in the digits array with the pasted data
    const newDigits = [...digits];
    const pastedChars = pastedData.split("");

    // Fill as many digits as possible
    for (let i = 0; i < Math.min(6, pastedChars.length); i++) {
      newDigits[i] = pastedChars[i];
    }

    setDigits(newDigits);

    // Focus the appropriate input after pasting
    if (pastedChars.length < 6) {
      inputRefs.current[pastedChars.length]?.focus();
    } else {
      // Focus the last input if all digits are filled
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otp = digits.join("");

    if (otp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      console.log(`Submitting OTP: ${otp}`);

      const response = await fetch("/api/attendance/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp,
          courseId,
          lectureId,
          scheduleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify attendance");
      }

      const data = await response.json();
      onSuccess(data);
    } catch (error) {
      console.error("Error verifying attendance:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verification</CardTitle>
          {lectureInfo && (
            <div className="mt-2 text-sm">
              <p className="font-medium text-blue-600">{lectureInfo.course}</p>
              <p className="text-gray-700">{lectureInfo.title}</p>
            </div>
          )}
          <p className="text-gray-600 mt-2">
            Please type the one-time password to mark your attendance
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-2 mb-6">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={setRef(index)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={digit}
                maxLength={1}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-xl font-semibold border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={digits.some((d) => !d) || isSubmitting}
            className="w-full bg-blue-600 text-white py-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
