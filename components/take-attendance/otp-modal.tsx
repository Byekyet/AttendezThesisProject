"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface OTPModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function OTPModal({ courseId, isOpen, onClose }: OTPModalProps) {
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes in seconds

  useEffect(() => {
    if (!isOpen) return;

    const generateOTP = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/attendance/generate-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate OTP");
        }

        const data = await response.json();
        setOtp(data.otp);

        // Set expiry time (5 minutes from now)
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 5);
        setExpiryTime(expiry);
      } catch (error) {
        console.error("Error generating OTP:", error);
        toast({
          title: "Error",
          description: "Failed to generate OTP code.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    generateOTP();
  }, [courseId, isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !expiryTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.max(
        0,
        Math.floor((expiryTime.getTime() - now.getTime()) / 1000)
      );

      setCountdown(diff);

      if (diff <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, isOpen]);

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[400px] max-w-[90%]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Verification
          </CardTitle>
          <CardDescription className="text-center">
            Please enter the one-time password to mark your attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2 text-3xl font-bold text-blue-600">
                {otp.split("").map((digit, index) => (
                  <span key={index}>{digit}</span>
                ))}
                <div className="ml-4 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full border-4 border-blue-600 relative">
                    <div
                      className="absolute inset-0.5 rounded-full"
                      style={{
                        background: `conic-gradient(rgb(37, 99, 235) ${
                          (countdown / 300) * 100
                        }%, transparent 0)`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-500">
                This code will expire in {formatCountdown()}
              </p>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onClose}>
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
