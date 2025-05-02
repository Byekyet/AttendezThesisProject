"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import useSWR from "swr";
import { Role } from "@prisma/client";


interface Course {
  id: string;
  name: string;
  code: string;
}

interface CourseUser {
  id: string;
  courseId: string;
  course: Course;
}

interface Attendance {
  id: string;
  status: string;
  lecture: {
    course: Course;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface Request {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    courses: CourseUser[];
  };
  sections?: CourseUser[];
  attendances?: Attendance[];
  pendingRequests?: Request[];
}

interface CourseAttendanceStats {
  course: Course;
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: string;
  };
}


const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: false,
  });

  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  const {
    data: dashboardData,
    error,
    isLoading,
  } = useSWR<DashboardData>(
    status === "authenticated" ? "/api/dashboard" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  
  const getStudentStats = (): {
    courseAttendance: CourseAttendanceStats[];
  } | null => {
    if (!dashboardData?.user?.courses || !dashboardData?.attendances) {
      return null;
    }

    
    const courseAttendance = dashboardData.user.courses.map(
      (enrollment: CourseUser) => {
        const courseId = enrollment.courseId;

        
        const courseAttendances =
          dashboardData.attendances?.filter(
            (a: Attendance) => a.lecture.course.id === courseId
          ) || [];

        
        const total = courseAttendances.length;
        const present = courseAttendances.filter(
          (a: Attendance) => a.status === "PRESENT"
        ).length;
        const absent = courseAttendances.filter(
          (a: Attendance) => a.status === "ABSENT"
        ).length;
        const late = courseAttendances.filter(
          (a: Attendance) => a.status === "LATE"
        ).length;
        const excused = courseAttendances.filter(
          (a: Attendance) => a.status === "EXCUSED"
        ).length;

        
        const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;

        return {
          course: enrollment.course,
          stats: {
            total,
            present,
            absent,
            late,
            excused,
            attendanceRate: attendanceRate.toFixed(1),
          },
        };
      }
    );

    return { courseAttendance };
  };

  const studentData =
    dashboardData?.user?.role === "STUDENT" ? getStudentStats() : null;

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; 
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-bold">User not found</h2>
        <p className="text-muted-foreground">
          There was a problem loading your data. Please try logging in again.
        </p>
      </div>
    );
  }

  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {dashboardData.user.role === "TEACHER" && (
          <Link href="/attendance/take">
            <Button variant="outline" size="sm">
              Take attendance
            </Button>
          </Link>
        )}
      </div>

      {dashboardData.user.role === "TEACHER" && dashboardData.sections && (
        <>
          <Card className="bg-white">
            <CardHeader className="p-4 pb-2">
              <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
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
                  {dashboardData.sections.map(
                    (section: CourseUser, index: number) => (
                      <TableRow key={section.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Link
                            href={`/attendance/take?courseId=${section.courseId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {`G${101 + index}`}
                          </Link>
                        </TableCell>
                        <TableCell>{section.course.code}</TableCell>
                        <TableCell>{section.course.name}</TableCell>
                        <TableCell>F103</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {dashboardData.pendingRequests &&
            dashboardData.pendingRequests.length > 0 && (
              <Card className="bg-white">
                <CardHeader className="p-4 pb-2">
                  <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.pendingRequests.map((request: Request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.user.name}</TableCell>
                          <TableCell>
                            <span className="capitalize">
                              {request.type.toLowerCase()}
                            </span>
                          </TableCell>
                          <TableCell>{request.description}</TableCell>
                          <TableCell>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Link href={`/requests/${request.id}`}>
                              <Button size="sm" variant="outline">
                                Review
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
        </>
      )}

      {dashboardData.user.role === "STUDENT" && studentData && (
        <Card className="bg-white">
          <CardHeader className="p-4 pb-2">
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course code</TableHead>
                  <TableHead>Course name</TableHead>
                  <TableHead>Attendance rate</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Late</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentData.courseAttendance.map(
                  (item: CourseAttendanceStats) => (
                    <TableRow key={item.course.id}>
                      <TableCell>{item.course.code}</TableCell>
                      <TableCell>
                        <Link
                          href={`/attendance/view?courseId=${item.course.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {item.course.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${item.stats.attendanceRate}%` }}
                            ></div>
                          </div>
                          <span>{item.stats.attendanceRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.stats.present}</TableCell>
                      <TableCell>{item.stats.absent}</TableCell>
                      <TableCell>{item.stats.late}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
