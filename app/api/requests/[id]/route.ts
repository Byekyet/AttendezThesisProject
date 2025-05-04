import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { RequestStatus } from "@prisma/client";

// GET: Fetch a specific request by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;
    const userId = session.user.id;
    const userRole = session.user.role;

    if (!requestId) {
      return NextResponse.json(
        { message: "Request ID is required" },
        { status: 400 }
      );
    }

    let request;

    if (userRole === "TEACHER") {
      // Check if the teacher is assigned to the course
      request = await prisma.request.findUnique({
        where: {
          id: requestId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      if (!request) {
        return NextResponse.json(
          { message: "Request not found" },
          { status: 404 }
        );
      }

      // Verify the teacher has access to this course
      const teacherCourse = await prisma.courseUser.findFirst({
        where: {
          userId: userId,
          courseId: request.courseId,
          role: "TEACHER",
        },
      });

      if (!teacherCourse) {
        return NextResponse.json(
          { message: "You don't have access to this request" },
          { status: 403 }
        );
      }
    } else {
      // For students, only get their own requests
      request = await prisma.request.findFirst({
        where: {
          id: requestId,
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
      });

      if (!request) {
        return NextResponse.json(
          { message: "Request not found or you don't have access" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PATCH: Update a request's status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only teachers can update request status
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const requestId = params.id;
    const userId = session.user.id;
    const { status, comment } = await req.json();

    if (!requestId) {
      return NextResponse.json(
        { message: "Request ID is required" },
        { status: 400 }
      );
    }

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { message: "Valid status is required (APPROVED or REJECTED)" },
        { status: 400 }
      );
    }

    // Get the request
    const request = await prisma.request.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    // Verify the teacher has access to this course
    const teacherCourse = await prisma.courseUser.findFirst({
      where: {
        userId: userId,
        courseId: request.courseId,
        role: "TEACHER",
      },
    });

    if (!teacherCourse) {
      return NextResponse.json(
        { message: "You don't have access to this request" },
        { status: 403 }
      );
    }

    // Update the request status
    const updatedRequest = await prisma.request.update({
      where: {
        id: requestId,
      },
      data: {
        status: status as RequestStatus,
        description: comment
          ? `${request.description}\n\nTeacher comment: ${comment}`
          : request.description,
      },
    });

    return NextResponse.json({
      message: `Request ${status.toLowerCase()} successfully`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
