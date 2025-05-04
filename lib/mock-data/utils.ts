import { RequestType, RequestStatus, Status } from "@prisma/client";

// Define constants directly in this file to avoid circular dependencies
const ATTENDANCE_STATUSES = [
  Status.PRESENT,
  Status.ABSENT,
  Status.LATE,
  Status.EXCUSED,
];

const REQUEST_TYPES = [
  RequestType.ABSENCE,
  RequestType.LATE,
  RequestType.RE_REGISTRATION,
  RequestType.LEAVE,
  RequestType.OTHER,
];

const REQUEST_STATUSES = [
  RequestStatus.PENDING,
  RequestStatus.APPROVED,
  RequestStatus.REJECTED,
];

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

/**
 * Get a random element from an array
 */
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random number of elements from an array
 */
export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Get a random integer between min and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a date for a specific week and day
 * @param weeksAgo Number of weeks ago from current date
 * @param dayOfWeek Day of week (0-6, where 0 is Sunday)
 */
export function generateDateForWeekAndDay(
  weeksAgo: number,
  dayOfWeek: number
): Date {
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

/**
 * Generate a random attendance status with weighted probabilities
 */
export function generateWeightedAttendanceStatus() {
  // Weights: Present (70%), Late (15%), Absent (10%), Excused (5%)
  const random = Math.random() * 100;

  if (random < 70) {
    return ATTENDANCE_STATUSES[0]; // PRESENT
  } else if (random < 85) {
    return ATTENDANCE_STATUSES[2]; // LATE
  } else if (random < 95) {
    return ATTENDANCE_STATUSES[1]; // ABSENT
  } else {
    return ATTENDANCE_STATUSES[3]; // EXCUSED
  }
}

/**
 * Generate a random request description
 */
export function generateRandomRequestDescription(): string {
  return getRandomElement(REQUEST_DESCRIPTIONS);
}

/**
 * Generate a random request type
 */
export function generateRandomRequestType() {
  return getRandomElement(REQUEST_TYPES);
}

/**
 * Generate a random request status
 */
export function generateRandomRequestStatus() {
  return getRandomElement(REQUEST_STATUSES);
}
