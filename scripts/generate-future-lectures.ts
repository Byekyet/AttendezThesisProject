import { PrismaClient } from "@prisma/client";

async function generateFutureLectures() {
  console.log("Starting future lecture generation script...");
  const prisma = new PrismaClient();

  try {
    // Get all courses
    const courses = await prisma.course.findMany();
    console.log(`Found ${courses.length} courses`);

    for (const course of courses) {
      console.log(`Processing course: ${course.name}`);

      // Get the most recent lecture for this course
      const latestLecture = await prisma.lecture.findFirst({
        where: { courseId: course.id, type: "LECTURE" },
        orderBy: { date: "desc" },
      });

      if (!latestLecture) {
        console.log(`No lectures found for ${course.name}, skipping`);
        continue;
      }

      console.log(`Latest lecture date: ${latestLecture.date}`);

      // Get existing lecture count to determine next lecture number
      const existingLectureCount = await prisma.lecture.count({
        where: { courseId: course.id, type: "LECTURE" },
      });

      // Get existing practice count
      const existingPracticeCount = await prisma.lecture.count({
        where: { courseId: course.id, type: "PRACTICE" },
      });

      console.log(`Existing lecture count: ${existingLectureCount}`);
      console.log(`Existing practice count: ${existingPracticeCount}`);

      // Find a teacher for this course
      const courseTeacher = await prisma.courseUser.findFirst({
        where: {
          courseId: course.id,
          role: "TEACHER",
        },
      });

      if (!courseTeacher) {
        console.log(`No teacher found for ${course.name}, skipping`);
        continue;
      }

      const teacherId = courseTeacher.userId;
      console.log(`Using teacher ID: ${teacherId} for future lectures`);

      // Generate 4 future weeks
      for (let weekOffset = 1; weekOffset <= 4; weekOffset++) {
        // Create new lecture date (7 days * weekOffset from the last lecture)
        const latestDate = new Date(latestLecture.date);
        const newDate = new Date(latestDate);
        newDate.setDate(newDate.getDate() + 7 * weekOffset);

        // Format date as YYYY-MM-DD
        const formattedDate = newDate.toISOString().split("T")[0];

        // Create lecture with incremented number
        const newLectureNumber = existingLectureCount + weekOffset;
        const newLectureTitle = `Lecture ${newLectureNumber}: ${course.code}`;

        // Check if a lecture already exists for this date and course
        const existingLecture = await prisma.lecture.findFirst({
          where: {
            courseId: course.id,
            type: "LECTURE",
            date: new Date(formattedDate),
          },
        });

        if (existingLecture) {
          console.log(`Lecture already exists for ${formattedDate}, skipping`);
          continue;
        }

        console.log(
          `Creating future lecture: ${newLectureTitle} on ${formattedDate}`
        );

        // Create the new lecture
        await prisma.lecture.create({
          data: {
            title: newLectureTitle,
            date: new Date(formattedDate),
            startTime: latestLecture.startTime,
            endTime: latestLecture.endTime,
            type: "LECTURE",
            courseId: course.id,
            takenById: teacherId, // Add the teacher ID
          },
        });

        // Also create practice session with the same pattern but with correct sequential number
        const newPracticeNumber = existingPracticeCount + weekOffset;
        const newPracticeTitle = `Practice ${newPracticeNumber}: ${course.code}`;

        // Check if a practice already exists for this date and course
        const existingPractice = await prisma.lecture.findFirst({
          where: {
            courseId: course.id,
            type: "PRACTICE",
            date: new Date(formattedDate),
          },
        });

        if (existingPractice) {
          console.log(`Practice already exists for ${formattedDate}, skipping`);
          continue;
        }

        console.log(
          `Creating future practice: ${newPracticeTitle} on ${formattedDate}`
        );

        // Create the new practice session
        await prisma.lecture.create({
          data: {
            title: newPracticeTitle,
            date: new Date(formattedDate),
            startTime: latestLecture.startTime,
            // Add 1 hour to practice compared to lecture
            endTime: new Date(
              new Date(latestLecture.endTime).getTime() + 60 * 60 * 1000
            ),
            type: "PRACTICE",
            courseId: course.id,
            takenById: teacherId, // Add the teacher ID
          },
        });
      }
    }

    console.log("Future lecture generation complete!");
  } catch (error) {
    console.error("Error generating future lectures:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateFutureLectures().catch((error) => {
  console.error("Script execution failed:", error);
  process.exit(1);
});
