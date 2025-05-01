"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";

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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    roles: ["STUDENT"],
  },
  {
    title: "Mark Attendance",
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
        <path d="M9 12h6" />
        <path d="M12 9v6" />
        <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
      </svg>
    ),
    roles: ["STUDENT"],
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
        <path d="M12 11h4" />
        <path d="M12 5h8" />
        <path d="M12 17h2" />
        <rect width="4" height="4" x="2" y="10" rx="1" />
        <rect width="4" height="4" x="2" y="4" rx="1" />
        <rect width="4" height="4" x="2" y="16" rx="1" />
      </svg>
    ),
    roles: ["TEACHER"],
  },
  {
    title: "Requests",
    href: "/request",
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
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    roles: ["TEACHER", "STUDENT"],
  },
  {
    title: "Profile",
    href: "/profile",
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
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
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
      {filteredItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100",
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? "bg-gray-100 text-blue-600"
              : "text-gray-500"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
