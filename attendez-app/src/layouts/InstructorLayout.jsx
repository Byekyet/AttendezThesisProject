import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, Send, FileText } from "lucide-react";

const InstructorLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { name: "Dashboard",   icon: <LayoutDashboard className="w-5 h-5" />, route: "/instructor/dashboard" },
    { name: "Take attendance", icon: <Send className="w-5 h-5" />,       route: "/instructor/take-attendance" },
    { name: "Requests",    icon: <FileText className="w-5 h-5" />,        route: "/instructor/requests" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white p-4 border-r">
        <div className="text-2xl font-bold text-blue-600 mb-8">Attendez</div>
        <nav className="space-y-6">
          {navItems.map((item) => {
            const isActive = pathname === item.route;
            return (
              <div
                key={item.name}
                onClick={() => navigate(item.route)}
                className={
                  `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition ` +
                  (isActive
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100")
                }
              >
                {item.icon}
                {item.name}
              </div>
            );
          })}
        </nav>
        <div
          onClick={() => navigate("/")}
          className="absolute bottom-6 left-4 flex items-center gap-2 text-red-500 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log out</span>
        </div>
      </aside>

      <main className="flex-1 px-6 pt-6 pb-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default InstructorLayout;

