import React, { useState } from "react";
import { Bell, User, CheckCircle } from "lucide-react";

const RequestPage = () => {
  const [activeTab, setActiveTab] = useState("My requests");
  const [showSuccess, setShowSuccess] = useState(false);

  const requests = [
    { id: "001", type: "Re-registration", code: "INF 303", name: "Database management system 1", date: "2025.03.02", status: "New" },
    { id: "002", type: "On leave", code: "INF 303", name: "Database management system 1", date: "2025.03.02", status: "Approved" },
    { id: "003", type: "Re-registration", code: "INF 303", name: "Database management system 1", date: "2025.03.02", status: "New" },
    { id: "004", type: "Re-registration", code: "INF 303", name: "Database management system 1", date: "2025.03.02", status: "New" },
    { id: "005", type: "Re-registration", code: "INF 303", name: "Database management system 1", date: "2025.03.02", status: "Rejected" },
    { id: "006", type: "Registration", code: "INF 303", name: "Database management system 1", date: "2025.03.02", status: "Rejected" },
  ];

  return (
    <div className="px-2 pt-0 pb-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-xl font-semibold">My requests</h2>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-gray-500" />
          <User className="w-8 h-8 text-gray-600 border rounded-full p-1" />
        </div>
      </div>

      {/* Toggle Button */}
      <div className="mb-6 bg-gray-100 rounded-lg inline-flex p-1">
        {["My requests", "Send request"].map((tab) => (
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

      {/* My requests table */}
      {activeTab === "My requests" && (
        <div className="bg-white rounded-lg shadow overflow-auto">
          <table className="min-w-full table-fixed text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-6 py-3 w-1/12">Request id</th>
                <th className="px-6 py-3 w-2/12">Request type</th>
                <th className="px-6 py-3 w-2/12">Course code</th>
                <th className="px-6 py-3 w-4/12">Course name</th>
                <th className="px-6 py-3 w-2/12">Request date</th>
                <th className="px-6 py-3 w-1/12">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-3 font-bold">{r.id}</td>
                  <td className="px-6 py-3">{r.type}</td>
                  <td className="px-6 py-3">{r.code}</td>
                  <td className="px-6 py-3">{r.name}</td>
                  <td className="px-6 py-3">{r.date}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        r.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : r.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center px-4 py-2 text-sm text-gray-600 border-t">
            <span>1 - 10 of 145</span>
            <div className="flex gap-2">
              <button className="px-2">&lt;</button>
              <button className="px-3 py-1 rounded-full bg-blue-600 text-white">1</button>
              <button className="px-2">2</button>
              <span>...</span>
              <button className="px-2">10</button>
              <button className="px-2">11</button>
              <button className="px-2">&gt;</button>
            </div>
          </div>
        </div>
      )}

      {/* Send request form */}
      {activeTab === "Send request" && (
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-xl">
          <div className="flex flex-col gap-6">
            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Select the request type</label>
              <select className="w-full border rounded px-3 py-2 text-sm">
                <option>Re-register an attendance</option>
                <option>On leave</option>
                <option>Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm h-24"
                placeholder="Type your description here..."
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium mb-1">Select course</label>
              <select className="w-full border rounded px-3 py-2 text-sm">
                <option>INF 202: Database Management Systems 1</option>
              </select>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium mb-1">Select course schedule</label>
              <select className="w-48 border rounded px-3 py-2 text-sm">
                <option>Monday 09:00</option>
                <option>Wednesday 11:00</option>
                <option>Friday 14:00</option>
              </select>
            </div>

            {/* Confirm Button */}
            <div>
              <button
                onClick={() => setShowSuccess(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Successfully marked the attendance!
              </h2>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
                onClick={() => setShowSuccess(false)}
              >
                Back to home
              </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default RequestPage;
