import React from "react";

const StudentDashboard = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[900px] bg-white shadow-sm table-fixed overflow-hidden rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-left text-sm text-gray-600">
            <th className="w-12 px-4 py-3">#</th>
            <th className="w-32 px-4 py-3">Course code</th>
            <th className="w-64 px-4 py-3">Course name</th>
            <th className="w-24 px-4 py-3">Classroom</th>
            <th className="w-24 px-4 py-3">Attended</th>
            <th className="w-24 px-4 py-3 rounded-tr-lg">Absent</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-4 py-3 text-sm font-medium">{i + 1}</td>
              <td className="px-4 py-3 text-sm">INF 303</td>
              <td className="px-4 py-3 text-sm">
                Database management system 1
              </td>
              <td className="px-4 py-3 text-sm">F103</td>
              <td className="px-4 py-3 text-sm">-</td>
              <td className={`px-4 py-3 text-sm ${i === 5 ? "rounded-br-lg" : ""}`}>-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentDashboard;
