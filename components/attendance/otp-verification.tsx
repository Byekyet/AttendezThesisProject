import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface OTPVerificationProps {
  onVerify: (otp: string) => Promise<void>;
  onClose: () => void;
  error?: string | null;
  lectureInfo?: {
    title: string;
    course: string;
  } | null;
}

export function OTPVerification({
  onVerify,
  onClose,
  error,
  lectureInfo,
}: OTPVerificationProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle paste event for the entire OTP
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedDigits = pastedData.replace(/\D/g, "").split("").slice(0, 6);

    const newDigits = [...digits];
    pastedDigits.forEach((digit, index) => {
      if (index < 6) {
        newDigits[index] = digit;
      }
    });

    setDigits(newDigits);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otp = digits.join("");
    if (otp.length !== 6) return;

    setIsVerifying(true);
    try {
      console.log(`Submitting OTP: ${otp}`);
      await onVerify(otp);
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    // Auto-focus first input on component mount
    const firstInput = document.getElementById("otp-input-0");
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Verification</h2>

          {lectureInfo && (
            <div className="mt-2 mb-3 text-sm">
              <p className="font-medium text-blue-600">{lectureInfo.course}</p>
              <p className="text-gray-700">{lectureInfo.title}</p>
            </div>
          )}

          <p className="text-gray-600 mt-2">
            Please type the one-time password to mark your attendance
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {digits.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-xl font-semibold border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={digits.some((d) => !d) || isVerifying}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}
