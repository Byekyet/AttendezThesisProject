import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { RequestStatus, Status } from "@prisma/client";

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

    // Get the request with related lecture information
    const request = await prisma.request.findUnique({
      where: {
        id: requestId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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

    // Handle attendance status update if this is an attendance-related request
    // and if the request has an associated lecture
    if (request.lectureId && status === "APPROVED") {
      const requestType = request.type;
      let attendanceStatus: Status | null = null;

      // Determine the appropriate attendance status based on request type
      switch (requestType) {
        case "ABSENCE":
          attendanceStatus = Status.EXCUSED;
          break;
        case "LATE":
          attendanceStatus = Status.LATE;
          break;
        case "RE_REGISTRATION":
          attendanceStatus = Status.PRESENT;
          break;
        default:
          // No attendance status change for other request types
          break;
      }

      // Update attendance record if we have determined a status
      if (attendanceStatus) {
        // Check if attendance record exists
        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            userId: request.userId,
            lectureId: request.lectureId,
          },
        });

        if (existingAttendance) {
          // Update existing record
          await prisma.attendance.update({
            where: {
              id: existingAttendance.id,
            },
            data: {
              status: attendanceStatus,
            },
          });
        } else {
          // Create new attendance record
          await prisma.attendance.create({
            data: {
              userId: request.userId,
              lectureId: request.lectureId,
              status: attendanceStatus,
            },
          });
        }
      }
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
