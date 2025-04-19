import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentLayout from "./pages/StudentLayout";
import Dashboard from "./pages/StudentDashboard";
import MyAttendance from "./pages/StudentMyAttendance";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* 🧭 Wrap all student-related pages inside StudentLayout */}
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<MyAttendance />} />
          {/* You can keep adding: mark-attendance, request, etc. */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
