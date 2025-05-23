"use client";

import Link from "next/link";
import Image from "next/image";
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
      <div className="flex items-center">
        <div className="cursor-pointer">
          {user.image ? (
            <div className="h-10 w-10 rounded-full border border-gray-200 overflow-hidden relative">
              <Image
                src={user.image}
                alt="Profile"
                fill
                sizes="(max-width: 768px) 100vw, 40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-800">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
