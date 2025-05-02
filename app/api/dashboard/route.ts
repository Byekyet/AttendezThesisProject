import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    
    if (user.role === "TEACHER") {
      
      const sections = await prisma.courseUser.findMany({
        where: {
          userId: user.id,
          role: "TEACHER",
        },
        include: {
          course: true,
        },
      });

      
      const recentSessions = await prisma.lecture.findMany({
        where: {
          takenById: user.id,
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
        include: {
          course: true,
          attendances: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      
      const pendingRequests = await prisma.request.findMany({
        where: {
          status: "PENDING",
          
          lectureId: {
            in: await prisma.lecture
              .findMany({
                where: { takenById: user.id },
                select: { id: true },
              })
              .then((lectures) => lectures.map((l) => l.id)),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: 5,
      });

      return NextResponse.json({
        user,
        sections,
        recentSessions,
        pendingRequests,
      });
    } else if (user.role === "STUDENT") {
      
      const attendances = await prisma.attendance.findMany({
        where: {
          userId: user.id,
        },
        include: {
          lecture: {
            include: {
              course: true,
            },
          },
        },
      });

      return NextResponse.json({
        user,
        attendances,
      });
    } else {
      return NextResponse.json({
        user,
      });
    }
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
