import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const courseCount = await prisma.course.count();
  console.log("Total courses in database:", courseCount);

  const lectureCount = await prisma.lecture.count();
  console.log("Total lectures in database:", lectureCount);

  const coursesWithLectureCount = await prisma.course.findMany({
    include: {
      _count: {
        select: { lectures: true },
      },
    },
  });

  console.log("\nCourses with lecture counts:");
  coursesWithLectureCount.forEach((course) => {
    console.log(`- ${course.name}: ${course._count.lectures} lectures`);
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
