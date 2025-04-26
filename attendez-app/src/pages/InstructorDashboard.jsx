import React, { useState } from "react";
import { Bell, User } from "lucide-react";
import UserProfilePopup from "../components/UserProfilePopup";
import { Link } from "react-router-dom";

const sections = [
  { section: "G101", code: "INF 303", name: "Database management system 1", room: "F103" },
  { section: "G102", code: "INF 303", name: "Database management system 1", room: "F103" },
  { section: "G103", code: "INF 303", name: "Database management system 1", room: "F103" },
  { section: "G104", code: "INF 303", name: "Database management system 1", room: "F103" },
  { section: "G105", code: "INF 303", name: "Database management system 1", room: "F103" },
  { section: "G106", code: "INF 303", name: "Database management system 1", room: "F103" },
];

const InstructorDashboard = () => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="px-2 pt-0 pb-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-2">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="flex items-center gap-8">
          <Bell className="w-5 h-5 text-gray-500" />
          <button onClick={() => setShowProfile(p => !p)}>
            <User className="w-8 h-8 text-gray-600 border rounded-full p-1" />
          </button>
        </div>
      </div>

      {/* Profile popup */}
      {showProfile && <UserProfilePopup onClose={() => setShowProfile(false)} />}

      {/* Table container aligned left, fixed max width */}
      <div className="max-w-3xl overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="w-12 px-4 py-3">#</th>
              <th className="w-24 px-4 py-3">Section</th>
              <th className="w-28 px-4 py-3">Course code</th>
              <th className="px-4 py-3">Course name</th>
              <th className="w-24 px-4 py-3 rounded-tr-lg">Classroom</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s, i) => (
              <tr key={s.section} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 font-medium">{i + 1}</td>
                <td className="px-4 py-3">
                <Link
                to={`/instructor/take-attendance/manual?section=${s.section}`}
                className="underline text-blue-600 hover:text-blue-800"
                >
                {s.section}
                </Link>
                </td>
                <td className="px-4 py-3">{s.code}</td>
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorDashboard;
