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

const prisma = new PrismaClient();

// Mock data - Courses
const mockCourses = [
  {
    name: "Introduction to Computer Science",
    code: "CS101",
    description:
      "A foundational course covering basic computer science concepts.",
  },
  {
    name: "Web Development",
    code: "CS201",
    description: "Learn modern web development techniques and frameworks.",
  },
  {
    name: "Data Structures and Algorithms",
    code: "CS301",
    description: "Advanced course on data structures and algorithm design.",
  },
  {
    name: "Machine Learning",
    code: "CS420",
    description:
      "Introduction to machine learning principles and applications.",
  },
  {
    name: "Database Systems",
    code: "CS315",
    description: "Design and implementation of database management systems.",
  },
];

// Mock data - Students
const mockStudents = [
  {
    name: "Byekyet",
    email: "student@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    name: "Liam Smith",
    email: "liam.smith@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Olivia Davis",
    email: "olivia.davis@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    name: "Noah Wilson",
    email: "noah.wilson@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    name: "Ava Miller",
    email: "ava.miller@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    name: "James Taylor",
    email: "james.taylor@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    name: "Sophia Brown",
    email: "sophia.brown@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    name: "William Martinez",
    email: "william.martinez@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    name: "Isabella Anderson",
    email: "isabella.anderson@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    name: "Benjamin Thomas",
    email: "benjamin.thomas@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    name: "Mia Garcia",
    email: "mia.garcia@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    name: "Ethan Rodriguez",
    email: "ethan.rodriguez@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    name: "Charlotte Hernandez",
    email: "charlotte.hernandez@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/7.jpg",
  },
  {
    name: "Alexander Lopez",
    email: "alexander.lopez@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/7.jpg",
  },
  {
    name: "Amelia Gonzalez",
    email: "amelia.gonzalez@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/8.jpg",
  },
  {
    name: "Daniel Wilson",
    email: "daniel.wilson@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/8.jpg",
  },
  {
    name: "Harper Perez",
    email: "harper.perez@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/9.jpg",
  },
  {
    name: "Michael Thompson",
    email: "michael.thompson@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/9.jpg",
  },
  {
    name: "Evelyn White",
    email: "evelyn.white@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    name: "David Harris",
    email: "david.harris@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/10.jpg",
  },
];

// Utility functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDateForWeekAndDay(weeksAgo: number, dayOfWeek: number): Date {
  const date = new Date();
  const currentDay = date.getDay();

  // Calculate days to subtract to get to the start of the current week (Sunday)
  const daysToSunday = currentDay;

  // Calculate total days to subtract
  const totalDaysToSubtract = weeksAgo * 7 + daysToSunday - dayOfWeek;

  // Set the date
  date.setDate(date.getDate() - totalDaysToSubtract);

  // Reset hours to ensure consistent times
  date.setHours(0, 0, 0, 0);

  return date;
}

function generateWeightedAttendanceStatus() {
  // Weights: Present (70%), Late (15%), Absent (10%), Excused (5%)
  const random = Math.random() * 100;

  if (random < 70) {
    return Status.PRESENT;
  } else if (random < 85) {
    return Status.LATE;
  } else if (random < 95) {
    return Status.ABSENT;
  } else {
    return Status.EXCUSED;
  }
}

// Request descriptions
const REQUEST_DESCRIPTIONS = [
  "I was sick and couldn't attend the class",
  "Had a doctor's appointment",
  "Family emergency",
  "Transportation issues",
  "Internet connection problem during online class",
  "Participating in university sports competition",
  "Attending a conference",
  "Religious observance",
  "Death in the family",
  "Severe weather conditions prevented attendance",
  "Mental health day",
  "Visa appointment",
  "Job interview",
  "Volunteer work required by scholarship",
  "Car broke down on the way to class",
];

// Main function
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
  }

  // Create courses (5)
  const courses = [];
  for (const courseData of mockCourses) {
    const course = await prisma.course.create({
      data: courseData,
    });
    courses.push(course);
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
    }
  }

  // Create lectures for each course (10 weeks, 2 per week per course)
  const lectures = [];

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
          title: `Lecture - Week ${10 - week} - ${course.name}`,
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

      // Create the practice (Wednesday)
      const practiceStartTime = new Date(practiceDate);
      practiceStartTime.setHours(14, 0, 0); // 2 PM

      const practiceEndTime = new Date(practiceDate);
      practiceEndTime.setHours(15, 30, 0); // 3:30 PM

      const practice = await prisma.lecture.create({
        data: {
          title: `Practice - Week ${10 - week} - ${course.name}`,
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
    }
  }

  // Create attendance records for all lectures and all students
  for (const lecture of lectures) {
    try {
      // Verify the lecture exists in the database
      const verifyLecture = await prisma.lecture.findUnique({
        where: { id: lecture.id },
      });

      if (!verifyLecture) {
        console.error(
          `Lecture ${lecture.id} not found in database, skipping attendance creation`
        );
        continue;
      }

      for (const student of students) {
        try {
          // Generate random attendance status
          const status = generateWeightedAttendanceStatus();

          await prisma.attendance.create({
            data: {
              userId: student.id,
              lectureId: lecture.id,
              status,
            },
          });
        } catch (error) {
          console.error(
            `Error creating attendance for student ${student.id}, lecture ${lecture.id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error(`Error processing lecture ${lecture.id}:`, error);
    }
  }

  // Create 1-2 requests for each student
  for (const student of students) {
    try {
      const numRequests = getRandomInt(1, 2);
      let createdRequests = 0;

      for (let i = 0; i < numRequests; i++) {
        try {
          // Pick a random course
          const course = getRandomElement(courses);

          // Pick a random lecture from that course
          const courseLectures = lectures.filter(
            (lecture) => lecture.courseId === course.id
          );
          const lecture = getRandomElement(courseLectures);

          // Verify the lecture exists in the database
          const verifyLecture = await prisma.lecture.findUnique({
            where: { id: lecture.id },
          });

          if (!verifyLecture) {
            console.error(
              `Lecture ${lecture.id} not found in database, skipping request creation`
            );
            continue;
          }

          // Generate request data
          const requestType = getRandomElement([
            RequestType.ABSENCE,
            RequestType.LATE,
            RequestType.RE_REGISTRATION,
            RequestType.LEAVE,
            RequestType.OTHER,
          ]);
          const requestStatus = getRandomElement([
            RequestStatus.PENDING,
            RequestStatus.APPROVED,
            RequestStatus.REJECTED,
          ]);
          const description = getRandomElement(REQUEST_DESCRIPTIONS);

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
          createdRequests++;
        } catch (error) {
          console.error(
            `Error creating request for student ${student.id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error(
        `Error processing student ${student.id} for requests:`,
        error
      );
    }
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
