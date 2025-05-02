import { Metadata } from "next";
import TakeAttendanceView from "@/components/take-attendance/take-attendance-view";

export const metadata: Metadata = {
  title: "Take Attendance",
  description: "Take attendance for courses",
};

export default function TakeAttendancePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Take Attendance</h1>
      <TakeAttendanceView />
    </div>
  );
}
