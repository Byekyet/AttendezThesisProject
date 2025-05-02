import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { RequestType } from "@prisma/client";

// GET: Fetch all requests for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all requests for the current user
    const requests = await prisma.request.findMany({
      where: {
        userId: userId,
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the data for the client
    const formattedRequests = requests.map((request) => ({
      id: request.id,
      type: request.type,
      description: request.description,
      status: request.status,
      courseCode: request.course.code,
      courseName: request.course.name,
      requestDate: request.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json(formattedRequests);
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

    if (!type || !description || !courseId) {
      return NextResponse.json(
        { message: "Type, description and course are required" },
        { status: 400 }
      );
    }

    // Check if the user is enrolled in this course
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
        type: type as RequestType,
        description: description,
        courseId: courseId,
        scheduleId: scheduleId || undefined,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({
      message: "Request created successfully",
      request: {
        id: request.id,
        type: request.type,
        description: request.description,
        status: request.status,
        courseCode: request.course.code,
        courseName: request.course.name,
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
