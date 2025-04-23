import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Send,
  FileText,
} from "lucide-react";

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, route: "/dashboard" },
    { name: "My Attendance", icon: <ClipboardList className="w-5 h-5" />, route: "/attendance" },
    { name: "Mark my attendance", icon: <Send className="w-5 h-5" />, route: "/mark-attendance" },
    { name: "Request", icon: <FileText className="w-5 h-5" />, route: "/request" },
  ];

  const handleNavigation = (route) => {
    navigate(route);
  };

  const handleLogout = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-4 border-r">
        <div className="text-2xl font-bold text-blue-600 mb-8">Attendez</div>
        <nav className="space-y-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.route;
            return (
              <div
                key={item.name}
                onClick={() => handleNavigation(item.route)}
                className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition ${
                  isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.name}
              </div>
            );
          })}
        </nav>
        <div 
          onClick={handleLogout}
          className="absolute bottom-6 left-4 flex items-center gap-2 text-red-500 cursor-pointer">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log out</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-6 pt-6 pb-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
