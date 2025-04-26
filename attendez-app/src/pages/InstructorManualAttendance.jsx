import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bell, User, CheckCircle, XCircle } from "lucide-react";
import UserProfilePopup from "../components/UserProfilePopup";
import { parseISO, isAfter, format } from "date-fns";

const fakeFetchAttendance = (section) =>
  new Promise((res) => {
    // fake data: 3 sessions, 2 time slots each
    const sessions = [
      { date: "2025-09-30", times: ["09:00", "10:00"] },
      { date: "2025-10-06", times: ["09:00", "10:00"] },
      { date: "2025-10-13", times: ["09:00", "10:00"] },
    ];
    const students = [
      { id: "180103306", name: "John Doe" },
      { id: "180103307", name: "Jane Smith" },
      { id: "180103308", name: "Alex Johnson" },
    ];
    const grid = {};
    sessions.forEach((s) => {
      s.times.forEach((t) => {
        const key = `${s.date}_${t}`;
        grid[key] = {};
        students.forEach((st) => {
          grid[key][st.id] = Math.random() > 0.5; // random present/absent
        });
      });
    });
    setTimeout(() => res({ sessions, students, grid }), 300);
  });

export default function InstructorManualAttendance() {
  const { search } = useLocation();
  const section = new URLSearchParams(search).get("section") || "";

  const [showProfile, setShowProfile] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [grid, setGrid] = useState({});

  useEffect(() => {
    fakeFetchAttendance(section).then(({ sessions, students, grid }) => {
      setSessions(sessions);
      setStudents(students);
      setGrid(grid);
    });
  }, [section]);

  const isFuture = (date, time) =>
    isAfter(parseISO(`${date}T${time}`), new Date());

  const handleToggle = (date, time, studentId, checked) => {
    // if studentId is null, it's the "select all" in header
    const key = `${date}_${time}`;
    setGrid((g) => {
      const updated = { ...g[key] };
      if (studentId) {
        updated[studentId] = checked;
      } else {
        // apply to all students
        Object.keys(updated).forEach((id) => {
          updated[id] = checked;
        });
      }
      return { ...g, [key]: updated };
    });
  };

  const handleModifyClick = () => {
    if (editing) {
      fetch("/api/attendance/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, grid }),
      });
    }
    setEditing(!editing);
  };

  return (
    <div className="relative px-4 pt-2 pb-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Take attendance</h2>
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-500" />
          <button
            onClick={() => setShowProfile((p) => !p)}
            className="p-1 border rounded-full text-gray-600"
          >
            <User className="w-8 h-8" />
          </button>
        </div>
      </div>
      {showProfile && <UserProfilePopup onClose={() => setShowProfile(false)} />}

      {/* Toggle + Modify */}
      <div className="flex justify-between items-center mb-4">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
            Manual
          </button>
          <button className="px-4 py-2 text-sm text-gray-700">
            OTP Based
          </button>
        </div>
        <button
          onClick={handleModifyClick}
          className="text-blue-600 font-medium"
        >
          {editing ? "Save" : "Modify"}
        </button>
      </div>

      {/* Attendance grid */}
      <div className="overflow-auto">
        <table className="mx-auto bg-white shadow-sm rounded-lg table-fixed">
          <thead>
            {/* Dates row */}
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="px-4 py-3" />
              <th className="px-4 py-3" />
              {sessions.map((s) => (
                <th
                  key={s.date}
                  colSpan={s.times.length}
                  className="px-4 py-3 text-center"
                >
                  {format(parseISO(s.date), "yyyy.MM.dd")}
                  {editing && (
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        disabled={s.times.every((t) => isFuture(s.date, t))}
                        checked={s.times.every(
                          (t) =>
                            grid[`${s.date}_${t}`] &&
                            Object.values(grid[`${s.date}_${t}`]).every(
                              (v) => v
                            )
                        )}
                        onChange={(e) =>
                          s.times.forEach((t) =>
                            handleToggle(s.date, t, null, e.target.checked)
                          )
                        }
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
            {/* Times row */}
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="px-4 py-2">Id</th>
              <th className="px-4 py-2">Student Name</th>
              {sessions.flatMap((s) =>
                s.times.map((t) => (
                  <th
                    key={s.date + t}
                    className="px-4 py-2 text-center"
                  >
                    {t}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {students.map((st, i) => (
              <tr
                key={st.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 text-sm font-medium">{i + 1}</td>
                <td className="px-4 py-3 text-sm">{st.name}</td>
                {sessions.flatMap((s) =>
                  s.times.map((t) => {
                    const key = `${s.date}_${t}`;
                    const present = grid[key]?.[st.id] || false;
                    const disabled = isFuture(s.date, t);
                    return (
                      <td
                        key={key + st.id}
                        className="px-4 py-3 text-center"
                      >
                        {editing ? (
                          <input
                            type="checkbox"
                            disabled={disabled}
                            checked={present}
                            onChange={(e) =>
                              handleToggle(
                                s.date,
                                t,
                                st.id,
                                e.target.checked
                              )
                            }
                          />
                        ) : present ? (
                          <CheckCircle className="text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="text-red-500 mx-auto" />
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}