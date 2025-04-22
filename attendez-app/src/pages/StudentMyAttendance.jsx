import React, { useState } from "react";
import { CheckCircle, XCircle, Bell, User } from "lucide-react";
import { Pie } from "react-chartjs-2";

const MyAttendance = () => {
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState("Lecture");

  const attendanceData = [
    { id: 1, date: "2023.09.02", hour: "16:00", status: "present", classroom: "CROOM101" },
    { id: 2, date: "2023.09.02", hour: "16:00", status: "present", classroom: "CROOM101" },
    { id: 3, date: "2023.09.02", hour: "16:00", status: "present", classroom: "CROOM101" },
    { id: 4, date: "2023.09.02", hour: "16:00", status: "absent", classroom: "CROOM101" },
    { id: 5, date: "2023.09.02", hour: "16:00", status: "absent", classroom: "CROOM101" },
    { id: 6, date: "2023.09.02", hour: "16:00", status: "present", classroom: "CROOM101" },
    { id: 7, date: "2023.09.02", hour: "16:00", status: "present", classroom: "CROOM101" },
  ];

  const stats = {
    present: attendanceData.filter((d) => d.status === "present").length,
    absent: attendanceData.filter((d) => d.status === "absent").length,
    notSubmitted: 3,
  };

  const pieData = {
    labels: ["Present", "Absent", "Not submitted"],
    datasets: [
      {
        data: [stats.present, stats.absent, stats.notSubmitted],
        backgroundColor: ["#3b82f6", "#ec4899", "#e5e7eb"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="px-2 pt-0 pb-6">
      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-xl font-semibold">My attendance</h2>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-gray-500" />
          <User className="w-8 h-8 text-gray-600 border rounded-full p-1" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Select year</span>
          <select className="border px-3 py-2 rounded text-sm">
            <option>2024</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Select term</span>
          <select className="border px-3 py-2 rounded text-sm">
            <option>Spring</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Select course</span>
          <select className="border px-3 py-2 rounded text-sm w-84 max-w-full">
            <option>INF 202: Database Management Systems 1</option>
          </select>
        </div>
        <button
          onClick={() => setShowStats(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          View
        </button>
      </div>

      <hr className="mb-6 border-gray-300" />

      {showStats && (
        <>
          <div className="mb-6 bg-gray-100 rounded p-1 inline-flex">
            {["Lecture", "Practice"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded text-sm font-medium transition-all duration-150 ${
                  activeTab === tab ? "bg-blue-600 text-white" : "text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-[1.6] bg-white p-4 rounded shadow overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-sm">
                    <th className="text-left px-3 py-2 w-8">#</th>
                    <th className="text-left px-3 py-2 w-32">Date</th>
                    <th className="text-left px-3 py-2 w-24">Hour</th>
                    <th className="text-center px-3 py-2 w-24">Attendance</th>
                    <th className="text-left px-3 py-2 w-36">Classroom</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((entry) => (
                    <tr key={entry.id} className="border-t">
                      <td className="px-3 py-2">{entry.id}</td>
                      <td className="px-3 py-2">{entry.date}</td>
                      <td className="px-3 py-2">{entry.hour}</td>
                      <td className="px-3 py-2 text-center">
                        {entry.status === "present" ? (
                          <CheckCircle className="text-blue-600 w-5 h-5 mx-auto" />
                        ) : (
                          <XCircle className="text-pink-500 w-5 h-5 mx-auto" />
                        )}
                      </td>
                      <td className="px-3 py-2">{entry.classroom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex-[1] bg-white p-8 rounded shadow">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-6 py-4 rounded">
                  <CheckCircle className="w-4 h-4" /> Attended {stats.present}
                </div>
                <div className="flex items-center gap-2 bg-pink-100 text-pink-800 px-6 py-4 rounded">
                  <XCircle className="w-4 h-4" /> Missed {stats.absent}
                </div>
                <div className="bg-gray-100 text-gray-800 px-6 py-4 rounded">
                  Not submitted {stats.notSubmitted}
                </div>
              </div>
              <div className="max-w-[250px] mx-auto">
                <Pie data={pieData} width={250} height={250} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttendance;
