import {
  PrismaClient,
  Role,
  LectureType,
  VerifyType,
  Status,
  RequestType,
  RequestStatus,
} from "@prisma/client";
import bcrypt from "bcrypt";
import { mockCourses } from "../lib/mock-data/courses";
import { mockStudents } from "../lib/mock-data/students";
import {
  getRandomElement,
  getRandomInt,
  generateDateForWeekAndDay,
  generateWeightedAttendanceStatus,
  generateRandomRequestDescription,
  generateRandomRequestType,
  generateRandomRequestStatus,
} from "../lib/mock-data/utils";

const prisma = new PrismaClient();

async function main() {
  // Clean up database
  await prisma.otpSession.deleteMany({});
  await prisma.request.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.courseUser.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleaned. Starting to seed...");

  // Create a teacher
  const hashedPassword = await bcrypt.hash("password123", 10);

  const teacher = await prisma.user.create({
    data: {
      name: "John Smith",
      email: "teacher@example.com",
      password: hashedPassword,
      role: Role.TEACHER,
      profileImage: "https://randomuser.me/api/portraits/men/11.jpg",
    },
  });
  console.log(`Created teacher: ${teacher.name}`);

  // Create students (20)
  const students = [];
  for (const studentData of mockStudents) {
    const student = await prisma.user.create({
      data: {
        name: studentData.name,
        email: studentData.email,
        password: hashedPassword,
        role: Role.STUDENT,
        profileImage: studentData.profileImage,
      },
    });
    students.push(student);
    console.log(`Created student: ${student.name}`);
  }

  // Create courses (5)
  const courses = [];
  for (const courseData of mockCourses) {
    const course = await prisma.course.create({
      data: courseData,
    });
    courses.push(course);
    console.log(`Created course: ${course.name}`);
  }

  // Enroll teacher in all courses
  for (const course of courses) {
    await prisma.courseUser.create({
      data: {
        userId: teacher.id,
        courseId: course.id,
        role: Role.TEACHER,
      },
    });
    console.log(`Enrolled ${teacher.name} as teacher in ${course.name}`);
  }

  // Enroll students in all courses
  for (const student of students) {
    for (const course of courses) {
      await prisma.courseUser.create({
        data: {
          userId: student.id,
          courseId: course.id,
          role: Role.STUDENT,
        },
      });
      console.log(`Enrolled ${student.name} as student in ${course.name}`);
    }
  }

  // Create lectures for each course (10 weeks, 2 per week per course)
  const lectures = [];
  const now = new Date();

  for (const course of courses) {
    // Create lectures for 10 weeks
    for (let week = 0; week < 10; week++) {
      // Two lectures per week: Monday (lecture) and Wednesday (practice)
      const lectureDate = generateDateForWeekAndDay(week, 1); // Monday
      const practiceDate = generateDateForWeekAndDay(week, 3); // Wednesday

      // Create the lecture (Monday)
      const lectureStartTime = new Date(lectureDate);
      lectureStartTime.setHours(9, 0, 0); // 9 AM

      const lectureEndTime = new Date(lectureDate);
      lectureEndTime.setHours(10, 30, 0); // 10:30 AM

      const lecture = await prisma.lecture.create({
        data: {
          title: `Lecture ${week + 1}: ${course.code}`,
          courseId: course.id,
          takenById: teacher.id,
          type: LectureType.LECTURE,
          date: lectureDate,
          startTime: lectureStartTime,
          endTime: lectureEndTime,
          verifyType: VerifyType.MANUAL,
        },
      });

      lectures.push(lecture);
      console.log(`Created lecture for ${course.name} - Lecture ${week + 1}`);

      // Create the practice (Wednesday)
      const practiceStartTime = new Date(practiceDate);
      practiceStartTime.setHours(14, 0, 0); // 2 PM

      const practiceEndTime = new Date(practiceDate);
      practiceEndTime.setHours(15, 30, 0); // 3:30 PM

      const practice = await prisma.lecture.create({
        data: {
          title: `Practice ${week + 1}: ${course.code}`,
          courseId: course.id,
          takenById: teacher.id,
          type: LectureType.PRACTICE,
          date: practiceDate,
          startTime: practiceStartTime,
          endTime: practiceEndTime,
          verifyType: VerifyType.MANUAL,
        },
      });

      lectures.push(practice);
      console.log(`Created practice for ${course.name} - Practice ${week + 1}`);
    }
  }

  // Create attendance records for all lectures and all students
  for (const lecture of lectures) {
    for (const student of students) {
      // Generate random attendance status
      const status = generateWeightedAttendanceStatus();

      await prisma.attendance.create({
        data: {
          userId: student.id,
          lectureId: lecture.id,
          status,
        },
      });
    }
    console.log(`Created attendance records for ${lecture.title}`);
  }

  // Create 1-5 requests for each student
  for (const student of students) {
    const numRequests = getRandomInt(1, 5);

    for (let i = 0; i < numRequests; i++) {
      // Pick a random course
      const course = getRandomElement(courses);

      // Pick a random lecture from that course
      const courseLectures = lectures.filter(
        (lecture) => lecture.courseId === course.id
      );
      const lecture = getRandomElement(courseLectures);

      // Generate request data
      const requestType = generateRandomRequestType();
      const requestStatus = generateRandomRequestStatus();
      const description = generateRandomRequestDescription();

      await prisma.request.create({
        data: {
          userId: student.id,
          type: requestType,
          description,
          status: requestStatus,
          lectureId: lecture.id,
          courseId: course.id,
        },
      });
    }

    console.log(`Created ${numRequests} requests for ${student.name}`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
