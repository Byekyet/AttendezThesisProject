import { PrismaClient } from "@prisma/client";

async function fixLectureTitles() {
  console.log("Starting lecture title fix script...");
  const prisma = new PrismaClient();

  try {
    // Get all courses
    const courses = await prisma.course.findMany();
    console.log(`Found ${courses.length} courses`);

    for (const course of courses) {
      console.log(`Processing course: ${course.name}`);

      // Get all lectures for this course, ordered by date
      const lectures = await prisma.lecture.findMany({
        where: { courseId: course.id, type: "LECTURE" },
        orderBy: { date: "asc" },
      });
      console.log(`Found ${lectures.length} lectures for ${course.name}`);

      // FORCE UPDATE all lecture titles with sequential numbering
      for (let i = 0; i < lectures.length; i++) {
        const lecture = lectures[i];
        const lectureNumber = i + 1;
        const newTitle = `Lecture ${lectureNumber}: ${course.code}`;

        console.log(
          `FORCE Updating lecture ${lecture.id}: ${lecture.title} -> ${newTitle}`
        );
        await prisma.lecture.update({
          where: { id: lecture.id },
          data: { title: newTitle },
        });
      }

      // Get all practice sessions for this course, ordered by date
      const practices = await prisma.lecture.findMany({
        where: { courseId: course.id, type: "PRACTICE" },
        orderBy: { date: "asc" },
      });
      console.log(
        `Found ${practices.length} practice sessions for ${course.name}`
      );

      // FORCE UPDATE all practice titles with sequential numbering
      for (let i = 0; i < practices.length; i++) {
        const practice = practices[i];
        const practiceNumber = i + 1;
        const newTitle = `Practice ${practiceNumber}: ${course.code}`;

        console.log(
          `FORCE Updating practice ${practice.id}: ${practice.title} -> ${newTitle}`
        );
        await prisma.lecture.update({
          where: { id: practice.id },
          data: { title: newTitle },
        });
      }
    }

    // Also fix any standalone test lectures
    const testLectures = await prisma.lecture.findMany({
      where: {
        OR: [
          { title: { contains: "09:00" } },
          { title: { contains: "14:00" } },
          { title: { contains: "Monday" } },
        ],
      },
    });

    if (testLectures.length > 0) {
      console.log(`Found ${testLectures.length} test lectures`);
      for (const lecture of testLectures) {
        // Get course code
        const course = await prisma.course.findUnique({
          where: { id: lecture.courseId },
        });

        const courseCode = course?.code || "TEST";
        const newTitle = `Lecture 1: ${courseCode}`;

        console.log(
          `Updating test lecture ${lecture.id}: ${lecture.title} -> ${newTitle}`
        );
        await prisma.lecture.update({
          where: { id: lecture.id },
          data: { title: newTitle },
        });
      }
    }

    // One final check for any remaining lectures that don't have proper format
    const remainingLectures = await prisma.lecture.findMany({
      where: {
        NOT: {
          OR: [
            { title: { startsWith: "Lecture" } },
            { title: { startsWith: "Practice" } },
          ],
        },
      },
    });

    if (remainingLectures.length > 0) {
      console.log(
        `Found ${remainingLectures.length} remaining lectures to fix`
      );
      for (const lecture of remainingLectures) {
        // Get course code
        const course = await prisma.course.findUnique({
          where: { id: lecture.courseId },
        });

        const courseCode = course?.code || "COURSE";
        const type = lecture.type === "LECTURE" ? "Lecture" : "Practice";
        const newTitle = `${type} 1: ${courseCode}`;

        console.log(
          `Fixing remaining lecture ${lecture.id}: ${lecture.title} -> ${newTitle}`
        );
        await prisma.lecture.update({
          where: { id: lecture.id },
          data: { title: newTitle },
        });
      }
    }

    console.log("Lecture title fix complete!");
  } catch (error) {
    console.error("Error updating lecture titles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLectureTitles().catch((error) => {
  console.error("Script execution failed:", error);
  process.exit(1);
});
