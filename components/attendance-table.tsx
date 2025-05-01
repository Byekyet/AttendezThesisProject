import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AttendanceRecord {
  id: number;
  courseCode: string;
  courseName: string;
  classroom: string;
  attended: number;
  absent: number;
}

interface AttendanceTableProps {
  data: AttendanceRecord[];
}

export function AttendanceTable({ data }: AttendanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Course code</TableHead>
          <TableHead>Course name</TableHead>
          <TableHead>Classroom</TableHead>
          <TableHead className="text-center">Attended</TableHead>
          <TableHead className="text-center">Absent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record) => (
          <TableRow key={record.id}>
            <TableCell className="font-medium">{record.courseCode}</TableCell>
            <TableCell>{record.courseName}</TableCell>
            <TableCell>{record.classroom}</TableCell>
            <TableCell className="text-center">{record.attended}</TableCell>
            <TableCell className="text-center">{record.absent}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
