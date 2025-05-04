import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixLectureTitles() {
  console.log("Starting lecture title fix script...");

  try {
    // Get all courses
    const courses = await prisma.course.findMany();
    console.log(`Found ${courses.length} courses`);

    for (const course of courses) {
      console.log(`Processing course: ${course.name}`);

      // Get all lectures for this course, ordered by date
      const lectures = await prisma.lecture.findMany({
        where: {
          courseId: course.id,
          type: "LECTURE", // Only fix regular lectures, not practice sessions
        },
        orderBy: {
          date: "asc",
        },
      });

      console.log(`Found ${lectures.length} lectures for ${course.name}`);

      // Update lecture titles with sequential numbering
      for (let i = 0; i < lectures.length; i++) {
        const lecture = lectures[i];
        const lectureNumber = i + 1;
        const newTitle = `Lecture ${lectureNumber}: ${course.code}`;

        console.log(
          `Updating lecture ${lecture.id}: ${lecture.title} -> ${newTitle}`
        );

        await prisma.lecture.update({
          where: {
            id: lecture.id,
          },
          data: {
            title: newTitle,
          },
        });
      }

      // Get all practice sessions for this course, ordered by date
      const practices = await prisma.lecture.findMany({
        where: {
          courseId: course.id,
          type: "PRACTICE",
        },
        orderBy: {
          date: "asc",
        },
      });

      console.log(
        `Found ${practices.length} practice sessions for ${course.name}`
      );

      // Update practice titles with sequential numbering
      for (let i = 0; i < practices.length; i++) {
        const practice = practices[i];
        const practiceNumber = i + 1;
        const newTitle = `Practice ${practiceNumber}: ${course.code}`;

        console.log(
          `Updating practice ${practice.id}: ${practice.title} -> ${newTitle}`
        );

        await prisma.lecture.update({
          where: {
            id: practice.id,
          },
          data: {
            title: newTitle,
          },
        });
      }
    }

    console.log("Lecture title fix complete!");
  } catch (error) {
    console.error("Error fixing lecture titles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLectureTitles().catch((error) => {
  console.error("Script execution failed:", error);
  process.exit(1);
});
