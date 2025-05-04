import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the teacher
  const teacher = await prisma.user.findFirst({
    where: {
      role: Role.TEACHER,
    },
  });

  console.log("Teacher found:", teacher?.name, teacher?.id);

  // Find the course-user relationships for the teacher
  const teacherCourses = await prisma.courseUser.findMany({
    where: {
      userId: teacher?.id,
      role: Role.TEACHER,
    },
    include: {
      user: true,
      course: true,
    },
  });

  console.log(`\nTeacher has ${teacherCourses.length} course enrollments:`);
  for (const enrollment of teacherCourses) {
    console.log(
      `- Teacher ${enrollment.user.name} teaches ${enrollment.course.name} (${enrollment.course.code})`
    );
  }

  // Check all CourseUser records
  const courseUsers = await prisma.courseUser.findMany({
    where: { role: Role.TEACHER },
    include: {
      user: true,
      course: true,
    },
  });

  console.log(`\nTotal teacher course enrollments: ${courseUsers.length}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
