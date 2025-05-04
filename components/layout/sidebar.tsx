import React from "react";
import Link from "next/link";
import {
  LucideHome,
  LucideUserCheck,
  LucideClipboardCheck,
  LucideLogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ href, icon, label, active }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors",
        active && "bg-gray-100/50"
      )}
    >
      <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export function Sidebar() {
  return (
    <aside className="w-[260px] h-screen border-r border-gray-200 p-4 flex flex-col overflow-y-auto">
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
          A
        </div>
        <h1 className="text-xl font-bold">Attendez</h1>
      </div>

      <nav className="mt-8 space-y-1 flex-1">
        <SidebarItem
          href="/"
          icon={<LucideHome className="w-5 h-5" />}
          label="Dashboard"
          active
        />
        <SidebarItem
          href="/attendance"
          icon={<LucideClipboardCheck className="w-5 h-5" />}
          label="My Attendance"
        />
        <SidebarItem
          href="/mark"
          icon={<LucideUserCheck className="w-5 h-5" />}
          label="Mark my attendance"
        />
        <SidebarItem
          href="/request"
          icon={<LucideClipboardCheck className="w-5 h-5" />}
          label="Request"
        />
      </nav>

      <div className="border-t border-gray-200 pt-4 mt-auto">
        <SidebarItem
          href="/logout"
          icon={<LucideLogOut className="w-5 h-5" />}
          label="Log out"
        />
      </div>
    </aside>
  );
}
