import { Status } from "@prisma/client";

type AttendanceStatusBadgeProps = {
  status: Status;
};

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  let bgColor = "";
  let textColor = "";
  let label = "";

  switch (status) {
    case "PRESENT":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      label = "Present";
      break;
    case "ABSENT":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      label = "Absent";
      break;
    case "LATE":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      label = "Late";
      break;
    case "EXCUSED":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      label = "Excused";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
      label = "Unknown";
  }

  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {label}
    </span>
  );
}
