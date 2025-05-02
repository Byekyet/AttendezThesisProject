"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Status } from "@prisma/client";

type Course = {
  id: string;
  name: string;
  code: string;
  description?: string;
};

type Lecture = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
};

type AttendanceRecord = {
  userId: string;
  status: Status;
};

type AttendanceSheetProps = {
  course: Course;
  lecture: Lecture | null;
  onLectureChange: (lecture: Lecture | null) => void;
  mode: "manual" | "otp";
};

export default function AttendanceSheet({
  course,
  lecture,
  onLectureChange,
  mode,
}: AttendanceSheetProps) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, Status>
  >({});
  const [loadingLectures, setLoadingLectures] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch lectures for the selected course
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoadingLectures(true);
        const response = await fetch(
          `/api/attendance/sessions?courseId=${course.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch lecture sessions");
        }

        const data = await response.json();
        setLectures(
          data.map((lec: any) => ({
            ...lec,
            date: lec.date,
            startTime: lec.startTime,
            endTime: lec.endTime,
          }))
        );
      } catch (err) {
        console.error("Error fetching lectures:", err);
        toast({
          title: "Error",
          description: "Failed to load lecture sessions",
          variant: "destructive",
        });
      } finally {
        setLoadingLectures(false);
      }
    };

    fetchLectures();
  }, [course.id]);

  // Fetch students when a lecture is selected
  useEffect(() => {
    if (!lecture) return;

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const response = await fetch(
          `/api/attendance/students?courseId=${course.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();
        setStudents(data);

        // Initialize all students as present
        const initialStatus: Record<string, Status> = {};
        data.forEach((student: Student) => {
          initialStatus[student.id] = Status.PRESENT;
        });
        setAttendanceStatus(initialStatus);
      } catch (err) {
        console.error("Error fetching students:", err);
        toast({
          title: "Error",
          description: "Failed to load students",
          variant: "destructive",
        });
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [lecture, course.id]);

  const handleAttendanceChange = (studentId: string, status: Status) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const saveAttendance = async () => {
    if (!lecture) return;

    try {
      setSaving(true);

      const attendanceRecords: AttendanceRecord[] = Object.entries(
        attendanceStatus
      ).map(([userId, status]) => ({
        userId,
        status,
      }));

      const response = await fetch("/api/attendance/take", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lectureId: lecture.id,
          attendanceRecords,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save attendance");
      }

      toast({
        title: "Success",
        description: "Attendance records saved successfully",
      });
    } catch (err) {
      console.error("Error saving attendance:", err);
      toast({
        title: "Error",
        description: "Failed to save attendance records",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Render lecture selection if no lecture is selected
  if (!lecture) {
    if (loadingLectures) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {course.name} ({course.code}) - Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lectures.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No lecture sessions found for this course.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Course code</TableHead>
                  <TableHead>Course name</TableHead>
                  <TableHead>Classroom</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lectures.map((lec, index) => (
                  <TableRow
                    key={lec.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onLectureChange(lec)}
                  >
                    <TableCell>G{100 + index}</TableCell>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>F103</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render the attendance sheet for the selected lecture
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            {course.name} ({course.code}) - {lecture.title}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {new Date(lecture.date).toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 py-2">
            <div>
              <span className="text-sm font-medium">Date</span>
              <p className="text-sm text-muted-foreground">
                {lecture.date
                  ? new Date(lecture.date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Start Time</span>
              <p className="text-sm text-muted-foreground">
                {lecture.startTime
                  ? format(new Date(lecture.startTime), "HH:mm")
                  : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">End Time</span>
              <p className="text-sm text-muted-foreground">
                {lecture.endTime
                  ? format(new Date(lecture.endTime), "HH:mm")
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStudents ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>180103306</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2 justify-center">
                          <Button
                            size="icon"
                            variant={
                              attendanceStatus[student.id] === Status.PRESENT
                                ? "default"
                                : "outline"
                            }
                            className="rounded-full h-8 w-8"
                            onClick={() =>
                              handleAttendanceChange(student.id, Status.PRESENT)
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant={
                              attendanceStatus[student.id] === Status.ABSENT
                                ? "destructive"
                                : "outline"
                            }
                            className="rounded-full h-8 w-8"
                            onClick={() =>
                              handleAttendanceChange(student.id, Status.ABSENT)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={saveAttendance}
                  disabled={saving || students.length === 0}
                >
                  {saving ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
