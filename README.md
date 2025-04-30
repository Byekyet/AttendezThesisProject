# Attendez - Attendance Management System

A modern, comprehensive attendance tracking system built with Next.js, Prisma, and PostgreSQL.

## Overview

Attendez is a full-featured attendance management platform designed for educational institutions. It streamlines the process of tracking student attendance across courses, supports multiple verification methods, and includes a request system for absence justifications.

## Features

### Authentication & User Management
- **Multi-role Authentication**: Secure login for students and teachers
- **Profile Management**: Update personal information and profile images
- **Password Management**: Secure password changing functionality with validation
- **Role-based Access Control**: Different views and permissions based on user roles

### Student Features
- **Attendance Tracking**: View personal attendance records across all enrolled courses
- **Filter by Type**: Filter attendance by lecture or practice sessions
- **Attendance Marking**: Mark attendance through OTP verification process
- **Request System**: Submit absence/late justification requests with status tracking

### Teacher Features
- **Dashboard**: Overview of courses, recent attendance sessions, and statistics
- **Class Management**: Manage courses and scheduled lectures/practice sessions
- **Take Attendance**: Multiple methods for taking attendance:
  - **Manual Mode**: Mark students present/absent directly
  - **OTP Verification**: Generate one-time codes for student self-verification
- **Request Management**: Review and respond to student absence requests


## Project Structure

```
/attendee
├── app/
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page 
│   │   └── change-password/     # Password change page
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── dashboard/           # Main dashboard
│   │   ├── profile/             # User profile management
│   │   ├── attendance/          # Attendance related pages
│   │   │   ├── my/              # Student's attendance records
│   │   │   └── take/            # Teacher's attendance taking interface
│   │   ├── mark/                # Student attendance marking pages
│   │   │   ├── verify/          # OTP verification page
│   │   │   └── success/         # Success confirmation page
│   │   └── request/             # Request system
│   │       ├── new/             # Create new request
│   │       └── [id]/            # View specific request details
│   ├── api/                     # API routes for data operations
│   │   ├── auth/                # Authentication endpoints
│   │   │   ├── [...nextauth]/   # NextAuth configuration
│   │   │   └── register/        # User registration endpoint
│   │   ├── users/               # User management endpoints
│   │   │   ├── [id]/            # Specific user operations
│   │   │   └── me/              # Current user operations
│   │   ├── courses/             # Course management endpoints
│   │   │   └── [id]/            # Specific course operations
│   │   │       └── lectures/    # Lectures for specific course
│   │   ├── attendance/          # Attendance operations
│   │   │   ├── mark/            # Mark attendance endpoints
│   │   │   └── verify/          # OTP verification endpoint
│   │   └── requests/            # Request system endpoints
│   │       └── [id]/            # Specific request operations
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Landing page
├── components/                  # Reusable UI components
│   ├── ui/                      # Base UI components (buttons, cards, etc.)
│   ├── auth/                    # Authentication related components
│   │   ├── login-form.tsx       # Login form component
│   │   └── register-form.tsx    # Registration form component
│   ├── dashboard/               # Dashboard related components
│   │   ├── stats-card.tsx       # Statistics display card
│   │   ├── recent-activity.tsx  # Recent activity display
│   │   └── navigation.tsx       # Dashboard navigation
│   ├── attendance/              # Attendance related components
│   │   ├── attendance-table.tsx # Attendance records table
│   │   ├── take-manual.tsx      # Manual attendance taking interface
│   │   ├── take-otp.tsx         # OTP-based attendance interface
│   │   └── verify-form.tsx      # OTP verification form
│   ├── profile/                 # Profile related components
│   │   ├── profile-form.tsx     # Profile editing form
│   │   └── avatar-upload.tsx    # Profile image upload
│   └── requests/                # Request related components
│       ├── request-form.tsx     # Request submission form
│       └── request-list.tsx     # Request listing component
├── lib/                         # Utility functions and shared logic
│   ├── prisma.ts                # Prisma client configuration
│   ├── auth.ts                  # Authentication utilities
│   ├── utils/                   # General utility functions
│   │   ├── dates.ts             # Date manipulation utilities
│   │   ├── validation.ts        # Form validation logic
│   │   └── formatting.ts        # Text and data formatting utilities
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-auth.ts          # Authentication state hook
│   │   └── use-attendance.ts    # Attendance operations hook
│   └── types.ts                 # TypeScript type definitions
├── prisma/                      # Prisma ORM configuration
│   ├── schema.prisma            # Database schema definition
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Seed data for development
├── public/                      # Static files
│   ├── ui-images/               # UI reference images
│   └── assets/                  # Public assets (logos, icons)
├── middleware.ts                # Next.js middleware for authentication
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── package.json                 # Project dependencies
└── .env.example                 # Example environment variables
```

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String       @id @default(cuid())
  name          String
  email         String       @unique
  password      String       // Hashed password
  role          Role         @default(STUDENT)
  profileImage  String?      // URL to profile image
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  attendances   Attendance[]
  courses       CourseUser[]
  requests      Request[]
  otpSessions   OtpSession[]
  lecturesTaken Lecture[]    @relation("LectureTakenBy")
}

enum Role {
  ADMIN
  TEACHER
  STUDENT
}

model Course {
  id          String       @id @default(cuid())
  name        String
  code        String       @unique
  description String?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  users       CourseUser[]
  lectures    Lecture[]
}

model CourseUser {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([userId, courseId])
}

model Lecture {
  id          String       @id @default(cuid())
  title       String
  courseId    String
  takenById   String
  type        LectureType
  date        DateTime
  startTime   DateTime
  endTime     DateTime
  verifyType  VerifyType   @default(MANUAL)
  otpCode     String?      // For OTP verification
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  course      Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  takenBy     User         @relation("LectureTakenBy", fields: [takenById], references: [id])
  attendances Attendance[]
}

enum LectureType {
  LECTURE    // Theory sessions
  PRACTICE   // Practical sessions
}

enum VerifyType {
  MANUAL     // Teacher marks attendance manually
  OTP        // Students verify with OTP
}

model Attendance {
  id        String   @id @default(cuid())
  userId    String
  lectureId String
  status    Status   @default(PRESENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lecture   Lecture  @relation(fields: [lectureId], references: [id], onDelete: Cascade)

  @@unique([userId, lectureId])  // One attendance record per user per lecture
}

enum Status {
  PRESENT   // Student attended
  ABSENT    // Student did not attend
  LATE      // Student arrived late
  EXCUSED   // Absence excused (e.g., medical)
}

model Request {
  id          String        @id @default(cuid())
  userId      String
  type        RequestType
  description String        // Reason for request
  status      RequestStatus @default(PENDING)
  lectureId   String?       // Optional reference to specific lecture
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum RequestType {
  ABSENCE    // Request to excuse absence
  LATE       // Request to excuse lateness
  OTHER      // Other types of requests
}

enum RequestStatus {
  PENDING    // Request awaiting review
  APPROVED   // Request approved
  REJECTED   // Request rejected
}

model OtpSession {
  id        String   @id @default(cuid())
  userId    String
  otp       String   // Generated OTP code
  expiresAt DateTime // Expiration timestamp
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Technical Implementation Details

### Authentication Flow
1. **Login Process**:
   - User enters credentials
   - Server validates credentials against hashed password
   - JWT token issued with role information
   - Client stores token for subsequent requests

2. **Authorization Middleware**:
   - Next.js middleware checks JWT validity on protected routes
   - Redirects unauthorized access to login page
   - Role-based routing prevents access to unauthorized features

### Attendance Taking Flow (Teacher)
1. **Manual Mode**:
   - Teacher selects course and lecture
   - System displays enrolled students
   - Teacher marks attendance status for each student
   - Submission creates Attendance records in database

2. **OTP Mode**:
   - Teacher generates OTP for specific lecture
   - System creates OTP record with expiration
   - OTP displayed to share with students
   - System tracks verifications in real-time

### Attendance Marking Flow (Student)
1. **OTP Verification**:
   - Student enters OTP provided by teacher
   - System validates OTP against active sessions
   - On success, creates attendance record
   - On failure, provides error feedback with retry option

### Request System Flow
1. **Request Creation**:
   - Student submits request with type and justification
   - System creates request with PENDING status
   - Teacher notified of new request

2. **Request Processing**:
   - Teacher reviews request details
   - Teacher approves or rejects with optional feedback
   - Student notified of request status change
   - If approved, attendance record updated accordingly

## Technology Stack

- **Frontend**: 
  - Next.js 15 (App Router)
  - React 19
  - Tailwind CSS 4
  - shadcn/ui components
  
- **Backend**:
  - Next.js API Routes/Route Handlers
  - Prisma ORM
  - NextAuth.js
  
- **Database**:
  - PostgreSQL
  
- **Authentication**:
  - JWT-based authentication
  - Bcrypt password hashing
  
- **Deployment**:
  - Vercel (recommended)
  - Docker support for custom deployments

## Setup and Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/attendez.git
   cd attendez
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your database credentials and other configuration.

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the database (optional for development)**
   ```bash
   npx prisma db seed
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

## Performance Considerations

- **Static Site Generation (SSG)** for public pages
- **Server Components** for data-heavy interfaces
- **Incremental Static Regeneration (ISR)** for dashboard data
- **Edge Runtime** for authentication middleware
- **Connection Pooling** for database connections

## Security Measures

- **Password Hashing** using bcrypt
- **JWT with Proper Expiration** for authentication
- **CSRF Protection** for form submissions
- **Rate Limiting** on authentication endpoints
- **Input Validation** on all form submissions
- **Prepared Statements** via Prisma for SQL injection prevention

## Mobile Responsiveness

The UI is fully responsive with dedicated layouts for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## API Documentation

The API follows RESTful conventions:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/change-password` - Password change

### User Endpoints
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user

### Attendance Endpoints
- `GET /api/attendance` - List attendance records
- `POST /api/attendance/mark` - Mark attendance
- `POST /api/attendance/verify` - Verify OTP

### Request Endpoints
- `GET /api/requests` - List requests
- `POST /api/requests` - Create request
- `PUT /api/requests/[id]` - Update request status

## License

This project is licensed under the MIT License - see the LICENSE file for details.
