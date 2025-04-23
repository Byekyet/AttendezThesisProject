import React, { useState } from "react";
import { Bell, User } from "lucide-react";
import UserProfilePopup from "../components/UserProfilePopup";

const sections = [
  { section: "G101", code: "INF 303", name: "Database management system 1", room: "F103" },
  { section: "G102", code: "INF 303", name: "Database management system 1", room: "F103" },
  { section: "G103", code: "INF 303", name: "Database management system 1", room: "F103" },
  { section: "G104", code: "INF 303", name: "Database management system 1", room: "F103" },
  { section: "G105", code: "INF 303", name: "Database management system 1", room: "F103" },
  { section: "G106", code: "INF 303", name: "Database management system 1", room: "F103" },
];

const InstructorTakeAttendance = () => {
  const [method, setMethod] = useState("Manual");
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="relative px-2 pt-0 pb-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mt-2 mb-4">
        <h2 className="text-xl font-semibold">Take attendance</h2>
        <div className="flex items-center gap-8">
          <Bell className="w-5 h-5 text-gray-500" />
          <button onClick={() => setShowProfile(p => !p)}>
            <User className="w-8 h-8 text-gray-600 border rounded-full p-1" />
          </button>
        </div>
      </div>

      {/* Profile popup */}
      {showProfile && <UserProfilePopup onClose={() => setShowProfile(false)} />}

      {/* Toggle */}
      <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-6">
        {["Manual", "OTP Based"].map(opt => (
          <button
            key={opt}
            onClick={() => setMethod(opt)}
            className={
              "px-4 py-2 text-sm font-medium rounded transition " +
              (method === opt
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-200")
            }
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto max-w-max">
        <table className="table-fixed min-w-[700px] text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="w-12 px-6 py-3">#</th>
              <th className="w-24 px-6 py-3">Section</th>
              <th className="w-28 px-6 py-3">Course code</th>
              <th className="px-6 py-3">Course name</th>
              <th className="w-24 px-6 py-3 rounded-tr-lg">Classroom</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s, i) => (
              <tr
                key={s.section}
                className={
                  i % 2 === 0
                    ? "bg-white hover:bg-gray-50"
                    : "bg-gray-50 hover:bg-gray-100"
                }
              >
                <td className="px-6 py-4 font-medium">{i + 1}</td>
                <td className="px-6 py-4">
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="underline text-blue-600"
                  >
                    {s.section}
                  </a>
                </td>
                <td className="px-6 py-4">{s.code}</td>
                <td className="px-6 py-4">{s.name}</td>
                <td className="px-6 py-4">{s.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorTakeAttendance;
