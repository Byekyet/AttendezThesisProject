import { RequestType, RequestStatus, Status } from "@prisma/client";

// Request type options
export const REQUEST_TYPES = [
  RequestType.ABSENCE,
  RequestType.LATE,
  RequestType.RE_REGISTRATION,
  RequestType.LEAVE,
  RequestType.OTHER,
];

// Request status options
export const REQUEST_STATUSES = [
  RequestStatus.PENDING,
  RequestStatus.APPROVED,
  RequestStatus.REJECTED,
];

// Attendance status options
export const ATTENDANCE_STATUSES = [
  Status.PRESENT,
  Status.ABSENT,
  Status.LATE,
  Status.EXCUSED,
];

// Request descriptions
export const REQUEST_DESCRIPTIONS = [
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
