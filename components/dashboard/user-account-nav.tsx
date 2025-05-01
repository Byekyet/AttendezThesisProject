"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Role } from "@prisma/client";

type UserAccountNavProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    image?: string | null;
  };
};

export function UserAccountNav({ user }: UserAccountNavProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <div className="flex flex-col space-y-1 text-right">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-gray-500">{user.email}</p>
        </div>
        <div className="group relative flex cursor-pointer items-center gap-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div className="absolute right-0 top-full z-10 mt-1 hidden w-56 overflow-hidden rounded-lg border bg-white py-1 shadow-lg group-hover:block">
            <div className="px-4 py-3">
              <p className="text-sm">{user.name}</p>
              <p className="truncate text-sm font-medium text-gray-500">
                {user.email}
              </p>
              <p className="truncate text-xs text-gray-500 mt-1">
                {user.role === "TEACHER" ? "Teacher" : "Student"}
              </p>
            </div>
            <div className="border-t border-gray-100">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Profile
              </Link>
              <Link
                href="/change-password"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Change Password
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
