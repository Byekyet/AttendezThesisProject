import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        lecture: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        lecture: {
          date: "desc",
        },
      },
    });

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
