import Link from "next/link";
import { User, Course, Lecture, Request } from "@prisma/client";
import { Button } from "@/components/ui/button";
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
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarClock, FileText, Users } from "lucide-react";

// Define proper types for our props
type CourseWithStudents = Course & {
  users: Array<{
    user: {
      id: string;
      name: string;
    };
  }>;
};

type SectionType = {
  id: string;
  courseId: string;
  userId: string;
  course: CourseWithStudents;
};

type LectureWithDetails = Lecture & {
  course: Course;
  attendances: Array<{
    user: {
      id: string;
      name: string;
    };
  }>;
};

type RequestWithUser = Request & {
  user: {
    id: string;
    name: string;
    email: string;
  };
  type?: string;
};

type TeacherDashboardProps = {
  user: User & {
    courses: Array<{
      course: Course;
    }>;
  };
  additionalData?: {
    sections: SectionType[];
    recentSessions: LectureWithDetails[];
    pendingRequests: RequestWithUser[];
  } | null;
};

export function TeacherDashboard({
  user,
  additionalData,
}: TeacherDashboardProps) {
  // Map courses from user object for backward compatibility
  const courses = user.courses.map((cu) => cu.course);

  // Get sections from additional data
  const sections = additionalData?.sections || [];

  return (
    <div className="space-y-8">
      {/* Stats Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white border-blue-100">
          <CardContent className="flex items-center p-6">
            <div className="mr-4 rounded-full bg-blue-50 p-2">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Students
              </p>
              <h3 className="text-2xl font-bold">
                {sections.reduce(
                  (count, section) =>
                    count + (section.course.users?.length || 0),
                  0
                )}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-indigo-100">
          <CardContent className="flex items-center p-6">
            <div className="mr-4 rounded-full bg-indigo-50 p-2">
              <FileText className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <h3 className="text-2xl font-bold">{sections.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-purple-100">
          <CardContent className="flex items-center p-6">
            <div className="mr-4 rounded-full bg-purple-50 p-2">
              <CalendarClock className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Sessions This Month
              </p>
              <h3 className="text-2xl font-bold">
                {additionalData?.recentSessions?.length || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections Table */}
      <Card className="overflow-hidden bg-white border-gray-200">
        <CardHeader className="bg-white border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Your Sections</CardTitle>
              <CardDescription>
                Manage your classes and view student details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="hover:bg-gray-50">
                <TableHead className="font-medium text-gray-600 w-[80px]">
                  Section
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  Course code
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  Course name
                </TableHead>
                <TableHead className="font-medium text-gray-600">
                  Classroom
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.length > 0 ? (
                sections.map((section, index) => (
                  <TableRow
                    key={section.id}
                    className="hover:bg-gray-50 border-t border-gray-100"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/courses/${section.courseId}`}
                        className="text-blue-600 hover:underline"
                      >
                        G{index + 101}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {section.course.code || "INF 303"}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {section.course.name || "Database management system 1"}
                    </TableCell>
                    <TableCell className="text-gray-700">F103</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-gray-500"
                  >
                    No sections found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Sessions and Pending Requests */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Sessions */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Recent Attendance Sessions
              </CardTitle>
              <Link href="/attendance/take">
                <Button variant="outline" size="sm">
                  Take attendance
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {additionalData?.recentSessions &&
            additionalData.recentSessions.length > 0 ? (
              <div className="space-y-4">
                {additionalData.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex justify-between border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div>
                      <div className="font-medium">
                        {session.title || session.course.name + " Session"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.course.code} -{" "}
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 self-center">
                      {session.attendances.length} attendees
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No recent sessions found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pending Requests</CardTitle>
              <Link href="/requests">
                <Button variant="outline" size="sm">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {additionalData?.pendingRequests &&
            additionalData.pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {additionalData.pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex justify-between border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{request.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {request.type || "Absence"} Request
                      </div>
                    </div>
                    <div className="space-x-2 self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-sm px-2 text-xs"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 rounded-sm px-2 text-xs bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No pending requests
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-white border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Take Attendance</CardTitle>
            <CardDescription>
              Start a new attendance session for your classes
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/attendance/take" className="w-full">
              <Button className="w-full">Take Attendance</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-white border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Review Requests</CardTitle>
            <CardDescription>
              Review and approve student absence requests
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/request" className="w-full">
              <Button className="w-full">View Requests</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="bg-white border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Attendance Reports</CardTitle>
            <CardDescription>
              View and export attendance reports
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/reports" className="w-full">
              <Button className="w-full">View Reports</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
