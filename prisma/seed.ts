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

  // Create 2 users (1 teacher, 1 student)
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create teacher
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

  // Create student
  const student = await prisma.user.create({
    data: {
      name: "Emma Johnson",
      email: "student@example.com",
      password: hashedPassword,
      role: Role.STUDENT,
      profileImage: "https://randomuser.me/api/portraits/women/12.jpg",
    },
  });
  console.log(`Created student: ${student.name}`);

  // Create 3 courses
  const courses = [];
  const courseData = [
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
  ];

  for (const data of courseData) {
    const course = await prisma.course.create({
      data,
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

  // Enroll student in all courses
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

  // Create lectures for each course
  const now = new Date();
  const lectures = [];

  for (const course of courses) {
    // Create 5 lectures per course
    for (let i = 1; i <= 5; i++) {
      // Alternate between lecture and practice
      const lectureType =
        i % 2 === 0 ? LectureType.PRACTICE : LectureType.LECTURE;
      // Alternate between manual and OTP verification
      const verifyType = i % 3 === 0 ? VerifyType.OTP : VerifyType.MANUAL;

      // Create date for the lecture (past dates for the first 3, future for the rest)
      const lectureDate = new Date(now);
      if (i <= 3) {
        // Past lecture
        lectureDate.setDate(lectureDate.getDate() - (10 - i));
      } else {
        // Future lecture
        lectureDate.setDate(lectureDate.getDate() + i);
      }

      // Start time is 9 AM + i hours
      const startTime = new Date(lectureDate);
      startTime.setHours(9 + (i % 8), 0, 0);

      // End time is start time + 1.5 hours
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 90);

      const lecture = await prisma.lecture.create({
        data: {
          title: `${
            lectureType === LectureType.LECTURE ? "Lecture" : "Practice"
          } ${i} - ${course.name}`,
          courseId: course.id,
          takenById: teacher.id,
          type: lectureType,
          date: lectureDate,
          startTime,
          endTime,
          verifyType,
          otpCode:
            verifyType === VerifyType.OTP
              ? Math.floor(100000 + Math.random() * 900000).toString()
              : null,
        },
      });

      lectures.push(lecture);
      console.log(`Created ${lecture.title} for ${course.name}`);
    }
  }

  // Create attendance records for past lectures
  for (const lecture of lectures) {
    // Only create attendance for past lectures
    if (lecture.date > now) continue;

    // Create attendance for the student
    const statusOptions = [
      Status.PRESENT,
      Status.ABSENT,
      Status.LATE,
      Status.EXCUSED,
    ];
    const randomStatus =
      statusOptions[Math.floor(Math.random() * statusOptions.length)];

    await prisma.attendance.create({
      data: {
        userId: student.id,
        lectureId: lecture.id,
        status: randomStatus,
      },
    });

    console.log(
      `Created attendance record for ${student.name} - ${lecture.title}: ${randomStatus}`
    );
  }

  // Create 5 requests from the student
  const requestTypes = [
    RequestType.ABSENCE,
    RequestType.LATE,
    RequestType.OTHER,
  ];
  const requestDescriptions = [
    "I was sick and couldn't attend the class",
    "Had a doctor's appointment",
    "Family emergency",
    "Transportation issues",
    "Internet connection problem during online class",
  ];

  for (let i = 0; i < 5; i++) {
    // Pick a random request type
    const randomType =
      requestTypes[Math.floor(Math.random() * requestTypes.length)];
    // Pick a random status
    const statusOptions = [
      RequestStatus.PENDING,
      RequestStatus.APPROVED,
      RequestStatus.REJECTED,
    ];
    const randomStatus =
      statusOptions[Math.floor(Math.random() * statusOptions.length)];

    // Pick a random lecture (only past lectures)
    const pastLectures = lectures.filter((l) => l.date <= now);
    const randomLecture =
      pastLectures[Math.floor(Math.random() * pastLectures.length)];

    // Pick a random course
    const randomCourse = courses[Math.floor(Math.random() * courses.length)];

    await prisma.request.create({
      data: {
        userId: student.id,
        type: randomType,
        description: requestDescriptions[i],
        status: randomStatus,
        lectureId: randomLecture?.id || null,
        courseId: randomCourse.id,
      },
    });

    console.log(
      `Created request for ${student.name}: ${requestDescriptions[i]}`
    );
  }

  // Create 3 OTP sessions
  for (let i = 1; i <= 3; i++) {
    // Alternate between teacher and student
    const user = i % 2 === 0 ? teacher : student;

    // Create expiration date (some expired, some active)
    const expiryDate = new Date();
    if (i <= 1) {
      // Expired
      expiryDate.setHours(expiryDate.getHours() - i);
    } else {
      // Active
      expiryDate.setHours(expiryDate.getHours() + i);
    }

    await prisma.otpSession.create({
      data: {
        userId: user.id,
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
        expiresAt: expiryDate,
        verified: i % 2 === 0, // Some are verified
      },
    });

    console.log(`Created OTP session for ${user.name}`);
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
