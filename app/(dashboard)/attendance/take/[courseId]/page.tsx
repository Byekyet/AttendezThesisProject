"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Status } from "@prisma/client";
import { format } from "date-fns";

interface Student {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface Lecture {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

export default function ManualAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, Status>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) throw new Error("Failed to fetch course");

        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive",
        });
        router.push("/take-attendance");
      }
    };

    fetchCourse();
  }, [courseId, router]);

  // Fetch lectures when course is loaded
  useEffect(() => {
    if (!course) return;

    const fetchLectures = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/attendance/sessions?courseId=${courseId}`
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
        setLoading(false);
      }
    };

    fetchLectures();
  }, [course, courseId]);

  // Fetch students when a lecture is selected
  useEffect(() => {
    if (!selectedLecture) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/attendance/students?courseId=${courseId}`
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
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedLecture, courseId]);

  const handleAttendanceChange = (studentId: string, status: Status) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const saveAttendance = async () => {
    if (!selectedLecture) return;

    try {
      setSaving(true);

      const attendanceRecords = Object.entries(attendanceStatus).map(
        ([userId, status]) => ({
          userId,
          status,
        })
      );

      const response = await fetch("/api/attendance/take", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lectureId: selectedLecture.id,
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

  if (loading && !course) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const handleGoBack = () => {
    if (selectedLecture) {
      setSelectedLecture(null);
    } else {
      router.push("/attendance/take");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={handleGoBack} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {course?.name} ({course?.code})
        </h1>
      </div>

      {!selectedLecture ? (
        // Lecture selection
        <Card>
          <CardHeader>
            <CardTitle>Select Lecture Session</CardTitle>
          </CardHeader>
          <CardContent>
            {lectures.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-muted-foreground">
                  No lecture sessions found for this course.
                </p>
                <Button
                  className="mt-4"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      // Create a new lecture
                      const currentDate = new Date();
                      const startTime = new Date(currentDate);
                      const endTime = new Date(currentDate);
                      endTime.setMinutes(endTime.getMinutes() + 90); // 1.5 hour lecture

                      const response = await fetch(
                        `/api/attendance/sessions/create`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            courseId,
                            title: `${new Date().toLocaleDateString()} Lecture`,
                            date: new Date(
                              currentDate.setHours(0, 0, 0, 0)
                            ).toISOString(),
                            startTime: startTime.toISOString(),
                            endTime: endTime.toISOString(),
                            type: "LECTURE",
                            verifyType: "MANUAL",
                          }),
                        }
                      );

                      if (!response.ok) {
                        throw new Error("Failed to create lecture");
                      }

                      const newLecture = await response.json();
                      setLectures([newLecture, ...lectures]);
                      setSelectedLecture(newLecture);

                      toast({
                        title: "Success",
                        description: "New lecture session created",
                      });
                    } catch (error) {
                      console.error("Error creating lecture:", error);
                      toast({
                        title: "Error",
                        description: "Failed to create new lecture session",
                        variant: "destructive",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Create New Lecture Session
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lectures.map((lecture) => (
                    <TableRow key={lecture.id}>
                      <TableCell>{lecture.title}</TableCell>
                      <TableCell>
                        {new Date(lecture.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {format(new Date(lecture.startTime), "HH:mm")} -{" "}
                        {format(new Date(lecture.endTime), "HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => setSelectedLecture(lecture)}>
                          Take Attendance
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        // Attendance sheet
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {selectedLecture.title}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {new Date(selectedLecture.date).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 py-2">
                <div>
                  <span className="text-sm font-medium">Date</span>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedLecture.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Start Time</span>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedLecture.startTime), "HH:mm")}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">End Time</span>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedLecture.endTime), "HH:mm")}
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
              {loading ? (
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 w-full rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 w-full rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 w-full rounded animate-pulse"></div>
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
                                  attendanceStatus[student.id] ===
                                  Status.PRESENT
                                    ? "default"
                                    : "outline"
                                }
                                className="rounded-full h-8 w-8"
                                onClick={() =>
                                  handleAttendanceChange(
                                    student.id,
                                    Status.PRESENT
                                  )
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
                                  handleAttendanceChange(
                                    student.id,
                                    Status.ABSENT
                                  )
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
      )}
    </div>
  );
}
