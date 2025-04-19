import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Pie } from "react-chartjs-2";

const MyAttendance = () => {
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState("Lecture");

  const attendanceData = [
    { id: 1, date: "2023.09.02", status: "present" },
    { id: 2, date: "2023.09.02", status: "present" },
    { id: 3, date: "2023.09.02", status: "present" },
    { id: 4, date: "2023.09.02", status: "absent" },
    { id: 5, date: "2023.09.02", status: "absent" },
    { id: 6, date: "2023.09.02", status: "present" },
    { id: 7, date: "2023.09.02", status: "present" },
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
    <div className="p-6">
      {/*<h2 className="text-xl font-semibold mb-6">My attendance</h2>*/}

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <select className="border px-3 py-2 rounded">
          <option>2024</option>
        </select>
        <span>Select term</span>
        <select className="border px-3 py-2 rounded">
          <option>Spring</option>
        </select>
        <span>Select course</span>
        <select className="border px-3 py-2 rounded w-72">
          <option>INF 202: Database Management Systems 1</option>
        </select>
        <button
          onClick={() => setShowStats(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View
        </button>
      </div>

      {showStats && (
        <>
          <div className="mb-4 flex gap-6">
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "Lecture" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"
              }`}
              onClick={() => setActiveTab("Lecture")}
            >
              Lecture
            </button>
            <button
              className={`px-4 py-2 rounded ${
                activeTab === "Practice" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"
              }`}
              onClick={() => setActiveTab("Practice")}
            >
              Practice
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-white p-4 rounded shadow">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left px-2 py-1">#</th>
                    <th className="text-left px-2 py-1">Date</th>
                    <th className="text-left px-2 py-1">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((entry) => (
                    <tr key={entry.id} className="border-t">
                      <td className="px-2 py-2">{entry.id}</td>
                      <td className="px-2 py-2">{entry.date}</td>
                      <td className="px-2 py-2">
                        {entry.status === "present" ? (
                          <CheckCircle className="text-blue-600 w-5 h-5" />
                        ) : (
                          <XCircle className="text-pink-500 w-5 h-5" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex-1 bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="flex gap-4 mb-4">
                <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded">Attended {stats.present}</div>
                <div className="bg-pink-100 text-pink-800 px-3 py-2 rounded">Missed {stats.absent}</div>
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded">Not submitted {stats.notSubmitted}</div>
              </div>
              <Pie data={pieData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyAttendance;
