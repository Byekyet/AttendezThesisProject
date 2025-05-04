import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { RequestType, RequestStatus } from "@prisma/client";

// Define types to help with TypeScript
type RequestWithUser = {
  id: string;
  type: RequestType;
  description: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  user: { name: string } | null;
  course: { name: string; code: string };
  [key: string]: any;
};

type RequestWithoutUser = {
  id: string;
  type: RequestType;
  description: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  course: { name: string; code: string };
  [key: string]: any;
};

// GET: Fetch requests based on user role
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    if (userRole === "TEACHER") {
      // For teachers, get all requests from their courses
      const teacherCourses = await prisma.courseUser.findMany({
        where: {
          userId: userId,
          role: "TEACHER",
        },
        select: {
          courseId: true,
        },
      });

      const courseIds = teacherCourses.map((course) => course.courseId);

      const requests = await prisma.request.findMany({
        where: {
          courseId: {
            in: courseIds,
          },
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          course: {
            select: {
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Format the data for teachers
      const formattedRequests = requests.map((request) => {
        const typedRequest = request as unknown as RequestWithUser;
        return {
          id: typedRequest.id,
          type: typedRequest.type,
          description: typedRequest.description,
          status: typedRequest.status,
          requestDate: typedRequest.createdAt.toISOString().split("T")[0],
          courseCode: typedRequest.course.code,
          courseName: typedRequest.course.name,
          userName: typedRequest.user?.name,
        };
      });

      return NextResponse.json(formattedRequests);
    } else {
      // For students, only get their own requests
      const requests = await prisma.request.findMany({
        where: {
          userId: userId,
        },
        include: {
          course: {
            select: {
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Format the data for students
      const formattedRequests = requests.map((request) => {
        const typedRequest = request as unknown as RequestWithoutUser;
        return {
          id: typedRequest.id,
          type: typedRequest.type,
          description: typedRequest.description,
          status: typedRequest.status,
          requestDate: typedRequest.createdAt.toISOString().split("T")[0],
          courseCode: typedRequest.course.code,
          courseName: typedRequest.course.name,
        };
      });

      return NextResponse.json(formattedRequests);
    }
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST: Create a new request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { type, description, courseId, scheduleId } = await req.json();

    if (!type || !description) {
      return NextResponse.json(
        { message: "Type and description are required" },
        { status: 400 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if the user is enrolled in this course if courseId is provided
    const enrollment = await prisma.courseUser.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // Create the request
    const request = await prisma.request.create({
      data: {
        userId: userId,
        courseId: courseId,
        type: type as RequestType,
        description: description,
        lectureId: scheduleId,
      },
    });

    return NextResponse.json({
      message: "Request created successfully",
      request: {
        id: request.id,
        type: request.type,
        description: request.description,
        status: request.status,
        requestDate: request.createdAt.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
