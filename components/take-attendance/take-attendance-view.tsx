"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseList from "./course-list";
import OTPModal from "./otp-modal";
import { toast } from "@/components/ui/use-toast";

export default function TakeAttendanceView() {
  const [activeTab, setActiveTab] = useState<"manual" | "otp">("manual");
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset state when tab changes
  useEffect(() => {
    setSelectedCourse(null);
    setShowOTPModal(false);
  }, [activeTab]);

  const handleOTPCourseSelect = (course: any) => {
    setSelectedCourse(course);
    setShowOTPModal(true);
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
  };

  return (
    <div>
      <Tabs
        defaultValue="manual"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "manual" | "otp")}
      >
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="otp">OTP Based</TabsTrigger>
          </TabsList>

          <a href="/modify" className="text-primary hover:underline">
            Modify
          </a>
        </div>

        <TabsContent value="manual" className="mt-6">
          <CourseList onSelectCourse={() => {}} mode="manual" />
        </TabsContent>

        <TabsContent value="otp" className="mt-6">
          <CourseList onSelectCourse={handleOTPCourseSelect} mode="otp" />
        </TabsContent>
      </Tabs>

      {selectedCourse && (
        <OTPModal
          courseId={selectedCourse.id}
          isOpen={showOTPModal}
          onClose={handleCloseOTPModal}
        />
      )}
    </div>
  );
}
