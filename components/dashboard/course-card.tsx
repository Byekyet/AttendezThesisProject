import Link from "next/link";
import { Course } from "@prisma/client";

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="flex flex-col rounded-lg border bg-white">
      <div className="p-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold truncate">{course.name}</h3>
          <p className="text-sm text-gray-500">{course.code}</p>
        </div>
      </div>
      <div className="border-t p-4">
        <Link
          href={`/courses/${course.id}`}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
        >
          View Course
        </Link>
      </div>
    </div>
  );
}
