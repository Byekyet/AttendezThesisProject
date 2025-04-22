import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentLayout from "./pages/StudentLayout";
import Dashboard from "./pages/StudentDashboard";
import MyAttendance from "./pages/StudentMyAttendance";
import MarkAttendance from './pages/MarkMyAttendance';
import RequestPage from "./pages/StudentRequest";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<MyAttendance />} />
          <Route path="/mark-attendance" element={<MarkAttendance />} />
          <Route path="/request" element={<RequestPage />} />
          {/* Keep adding routes*/}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
