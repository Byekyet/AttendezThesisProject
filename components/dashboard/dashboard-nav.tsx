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
    title: "Request",
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
    <nav className="grid items-start gap-2">
      {filteredItems.map((item, index) => {
        // Check if this is the last item and add a separator before it
        const isLogoutItem = item.title === "Log out";

        return (
          <React.Fragment key={item.href}>
            {isLogoutItem && (
              <div className="my-3 border-t border-gray-200"></div>
            )}
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-50",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-blue-600 text-white"
                  : "text-gray-700"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
