import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentLayout from "./pages/StudentLayout";
import Dashboard from "./pages/StudentDashboard";
import MyAttendance from "./pages/StudentMyAttendance";
import MarkAttendance from './pages/MarkMyAttendance';
import RequestPage from "./pages/StudentRequest";
import InstructorLayout    from "./layouts/InstructorLayout";
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorTakeAttendance from "./pages/InstructorTakeAttendance";
import InstructorManualAttendance from "./pages/InstructorManualAttendance";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Student area */}
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<MyAttendance />} />
          <Route path="/mark-attendance" element={<MarkAttendance />} />
          <Route path="/request" element={<RequestPage />} />
        </Route>

        {/* Instructor area */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="take-attendance" element={<InstructorTakeAttendance/>} />
          <Route path="take-attendance/manual"element={<InstructorManualAttendance />}/>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}


export default App;
