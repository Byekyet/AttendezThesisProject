import React, { useState } from "react";
import { Bell, User } from "lucide-react";
import UserProfilePopup from "../components/UserProfilePopup";


const StudentDashboard = () => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="relative px-2 pt-0 pb-6 bg-gray-50 min-h-screen">
      {/* Header with title, bell, and user icon */}
      <div className="flex justify-between items-center mb-8 mt-2">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="flex items-center gap-8">
          <Bell className="w-5 h-5 text-gray-500" />
          <button onClick={() => setShowProfile((p) => !p)}>
            <User className="w-8 h-8 text-gray-600 border rounded-full p-1" />
          </button>
        </div>
      </div>

      {/* Profile popup */}
      {showProfile && (
        <UserProfilePopup onClose={() => setShowProfile(false)} />
      )}

      {/* Course Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] bg-white shadow-lg table-fixed overflow-hidden rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-600">
              <th className="w-12 px-4 py-3">#</th>
              <th className="w-20 px-4 py-3">Course code</th>
              <th className="w-48 px-4 py-3">Course name</th>
              <th className="w-20 px-4 py-3">Classroom</th>
              <th className="w-20 px-4 py-3">Attended</th>
              <th className="w-20 px-4 py-3 rounded-tr-lg">Absent</th>
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
                <td className={`px-4 py-3 text-sm ${i === 5 ? "rounded-br-lg" : ""}`}>
                  -
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDashboard;
