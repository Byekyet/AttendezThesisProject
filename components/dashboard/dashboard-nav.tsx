"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import React from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
    roles: ["TEACHER", "STUDENT"],
  },
  {
    title: "Course Management",
    href: "/courses",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        <path d="m9 10 2 2 4-4" />
      </svg>
    ),
    roles: ["TEACHER"],
  },
  {
    title: "Attendance List",
    href: "/attendance",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
      </svg>
    ),
    roles: ["TEACHER"],
  },
  {
    title: "Take Attendance",
    href: "/attendance/take",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    roles: ["TEACHER"],
  },
  {
    title: "My Attendance",
    href: "/attendance/my",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    roles: ["STUDENT"],
  },
  {
    title: "Mark my attendance",
    href: "/mark",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    roles: ["STUDENT"],
  },
  {
    title: "My Requests",
    href: "/requests",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 17h6" />
        <path d="M9 12h6" />
        <path d="M9 7h6" />
      </svg>
    ),
    roles: ["STUDENT"],
  },
  {
    title: "Manage Requests",
    href: "/requests",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    ),
    roles: ["TEACHER"],
  },
  {
    title: "Log out",
    href: "/api/auth/signout",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    roles: ["TEACHER", "STUDENT"],
  },
];

type DashboardNavProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
};

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <nav className="grid items-start gap-2 w-full overflow-y-auto">
      {filteredItems.map((item, index) => {
        // Check if this is the last item and add a separator before it
        const isLogoutItem = item.title === "Log out";

        // Improved active state logic for all routes
        let isActive = false;

        // Exact match for dashboard
        if (item.href === "/dashboard" && pathname === "/dashboard") {
          isActive = true;
        }
        // Check if pathname starts with the item's href but not just "/"
        else if (item.href !== "/" && pathname.startsWith(item.href)) {
          isActive = true;
        }
        // Special case for attendance routes
        else if (
          (item.href === "/attendance" &&
            (pathname === "/attendance" ||
              pathname.startsWith("/attendance/student"))) ||
          (item.href === "/attendance/take" &&
            pathname.startsWith("/attendance/take")) ||
          (item.href === "/attendance/my" &&
            pathname.startsWith("/attendance/my"))
        ) {
          isActive = true;
        }
        // Special case for the requests routes
        else if (
          item.href === "/requests" &&
          pathname.startsWith("/requests")
        ) {
          isActive = true;
        }

        return (
          <React.Fragment key={item.href + "-" + item.title}>
            {isLogoutItem && (
              <div className="my-3 border-t border-gray-200"></div>
            )}
            <div className="w-full overflow-hidden">
              <Link
                href={item.href}
                style={{ boxSizing: "border-box" }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-50 w-full border border-transparent",
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                    : "text-gray-700"
                )}
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="truncate flex-1">{item.title}</span>
              </Link>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
