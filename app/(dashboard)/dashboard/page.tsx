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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import useSWR from "swr";
import { Role } from "@prisma/client";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Check,
  Clock,
  X,
  FileText,
  Users,
  Layers,
} from "lucide-react";

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
    id: string;
    title: string;
    date: string;
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
  sections?: (CourseUser & {
    studentCount?: number;
    lastLecture?: {
      id: string;
      title: string;
      date: string;
    };
  })[];
  attendances?: Attendance[];
  pendingRequests?: Request[];
  recentSessions?: any[];
  courses?: (CourseUser & {
    stats: {
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
    };
    nextLecture?: {
      id: string;
      title: string;
      date: string;
    } | null;
  })[];
  courseSummary?: {
    totalCourses: number;
    totalStudents?: number;
    totalLectures?: number;
    upcomingLectures?: number;
  };
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
  nextLecture?: {
    id: string;
    title: string;
    date: string;
  } | null;
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
    if (!dashboardData?.user?.courses || !dashboardData?.courses) {
      return null;
    }

    const courseAttendance = dashboardData.courses.map(
      (
        courseData: CourseUser & {
          stats: {
            total: number;
            present: number;
            absent: number;
            late: number;
            excused: number;
          };
          nextLecture?: {
            id: string;
            title: string;
            date: string;
          } | null;
        }
      ) => {
        const attendanceRate =
          courseData.stats.total > 0
            ? ((courseData.stats.present + courseData.stats.late) /
                courseData.stats.total) *
              100
            : 0;

        return {
          course: courseData.course,
          stats: {
            ...courseData.stats,
            attendanceRate: attendanceRate.toFixed(1),
          },
          nextLecture: courseData.nextLecture,
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
          <div className="flex space-x-2">
            <Link href="/attendance/take">
              <Button size="sm">
                <ClipboardList className="h-4 w-4 mr-2" />
                Take attendance
              </Button>
            </Link>
          </div>
        )}
        {dashboardData.user.role === "STUDENT" && (
          <Link href="/mark">
            <Button size="sm">
              <Check className="h-4 w-4 mr-2" />
              Mark attendance
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <BookOpen className="h-10 w-10 text-blue-500 mb-2" />
            <CardTitle className="text-2xl font-bold">
              {dashboardData.user.courses?.length || 0}
            </CardTitle>
            <p className="text-sm text-gray-500">Courses</p>
          </CardContent>
        </Card>

        {dashboardData.user.role === "TEACHER" && (
          <>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <Calendar className="h-10 w-10 text-green-500 mb-2" />
                <CardTitle className="text-2xl font-bold">
                  {dashboardData.courseSummary?.totalLectures || 0}
                </CardTitle>
                <p className="text-sm text-gray-500">Total Lectures</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <FileText className="h-10 w-10 text-yellow-500 mb-2" />
                <CardTitle className="text-2xl font-bold">
                  {dashboardData.pendingRequests?.length || 0}
                </CardTitle>
                <p className="text-sm text-gray-500">Pending Requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <Layers className="h-10 w-10 text-purple-500 mb-2" />
                <CardTitle className="text-2xl font-bold">
                  {dashboardData.courseSummary?.totalStudents || 0}
                </CardTitle>
                <p className="text-sm text-gray-500">Students</p>
              </CardContent>
            </Card>
          </>
        )}

        {dashboardData.user.role === "STUDENT" && studentData && (
          <>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <Check className="h-10 w-10 text-green-500 mb-2" />
                <CardTitle className="text-2xl font-bold">
                  {studentData.courseAttendance.reduce(
                    (total, item) => total + item.stats.present,
                    0
                  )}
                </CardTitle>
                <p className="text-sm text-gray-500">Present</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <X className="h-10 w-10 text-red-500 mb-2" />
                <CardTitle className="text-2xl font-bold">
                  {studentData.courseAttendance.reduce(
                    (total, item) => total + item.stats.absent,
                    0
                  )}
                </CardTitle>
                <p className="text-sm text-gray-500">Absent</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <Clock className="h-10 w-10 text-yellow-500 mb-2" />
                <CardTitle className="text-2xl font-bold">
                  {studentData.courseAttendance.reduce(
                    (total, item) => total + item.stats.late,
                    0
                  )}
                </CardTitle>
                <p className="text-sm text-gray-500">Late</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Teacher Course Section */}
      {dashboardData.user.role === "TEACHER" && dashboardData.sections && (
        <Card className="bg-white shadow">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">My Courses</CardTitle>
              <Link href="/course/manage">
                <Button variant="ghost" size="sm">
                  Manage all courses
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dashboardData.sections.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Last Lecture</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.sections.map(
                    (
                      section: CourseUser & {
                        studentCount?: number;
                        lastLecture?: {
                          id: string;
                          title: string;
                          date: string;
                        };
                      }
                    ) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">
                          {section.course.code}
                        </TableCell>
                        <TableCell>{section.course.name}</TableCell>
                        <TableCell>
                          {section.studentCount ?? "N/A"} students
                        </TableCell>
                        <TableCell>
                          {section.lastLecture
                            ? new Date(
                                section.lastLecture.date
                              ).toLocaleDateString()
                            : "No lectures yet"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link
                              href={`/attendance/take?courseId=${section.courseId}`}
                            >
                              <Button size="sm" variant="outline">
                                <ClipboardList className="h-3 w-3 mr-1" />
                                Take
                              </Button>
                            </Link>
                            <Link href={`/course/${section.courseId}`}>
                              <Button size="sm" variant="outline">
                                <Layers className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-10 w-10 text-gray-400 mb-2" />
                <h3 className="font-medium">No courses found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  You have not been assigned to any courses yet.
                </p>
                <Link href="/course/new" className="mt-4">
                  <Button size="sm">Create a course</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Requests */}
      {dashboardData.user.role === "TEACHER" &&
        dashboardData.pendingRequests &&
        dashboardData.pendingRequests.length > 0 && (
          <Card className="bg-white shadow">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Pending Requests</CardTitle>
                <Link href="/requests">
                  <Button variant="ghost" size="sm">
                    View all requests
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.pendingRequests
                    .slice(0, 5)
                    .map((request: Request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.user.name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {request.type.toLowerCase().replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          {request.description}
                        </TableCell>
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

      {/* Student Courses */}
      {dashboardData.user.role === "STUDENT" && studentData && (
        <Card className="bg-white shadow">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">My Courses</CardTitle>
              <Link href="/mark">
                <Button variant="ghost" size="sm">
                  Mark attendance
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {studentData.courseAttendance.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Present/Absent/Late</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentData.courseAttendance.map(
                    (item: CourseAttendanceStats) => (
                      <TableRow key={item.course.id}>
                        <TableCell className="font-medium">
                          {item.course.code}
                        </TableCell>
                        <TableCell>{item.course.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className={`h-2.5 rounded-full ${
                                  parseFloat(item.stats.attendanceRate) >= 75
                                    ? "bg-green-600"
                                    : parseFloat(item.stats.attendanceRate) >=
                                      50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${item.stats.attendanceRate}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {item.stats.attendanceRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {item.stats.present} P
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {item.stats.absent} A
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {item.stats.late} L
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link
                              href={`/attendance/view?courseId=${item.course.id}`}
                            >
                              <Button size="sm" variant="outline">
                                <Layers className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </Link>
                            <Link
                              href={`/requests/new?courseId=${item.course.id}`}
                            >
                              <Button size="sm" variant="ghost">
                                <FileText className="h-3 w-3 mr-1" />
                                Request
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-10 w-10 text-gray-400 mb-2" />
                <h3 className="font-medium">No courses found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  You are not enrolled in any courses yet.
                </p>
                <Link href="/course/enroll" className="mt-4">
                  <Button size="sm">Find courses</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Attendance History for Students */}
      {dashboardData.user.role === "STUDENT" &&
        dashboardData.attendances &&
        dashboardData.attendances.length > 0 && (
          <Card className="bg-white shadow">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg">Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Date</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Lecture</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.attendances
                    .slice(0, 5)
                    .map((attendance: Attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell>
                          {new Date(
                            attendance.lecture.date
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{attendance.lecture.course.name}</TableCell>
                        <TableCell>{attendance.lecture.title}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${
                          attendance.status === "PRESENT"
                            ? "bg-green-100 text-green-800"
                            : attendance.status === "ABSENT"
                            ? "bg-red-100 text-red-800"
                            : attendance.status === "LATE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                          >
                            {attendance.status.toLowerCase()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t">
                <Link href="/attendance/history">
                  <Button variant="outline" size="sm" className="w-full">
                    View all attendance history
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
