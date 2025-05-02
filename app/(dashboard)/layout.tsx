import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "../../components/dashboard/dashboard-nav";
import { UserAccountNav } from "../../components/dashboard/user-account-nav";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?error=SessionExpired");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 min-h-screen">
        <aside className="w-[230px] border-r border-gray-100 px-4 py-6 hidden md:block">
          <div className="mb-6">
            <Link href="/dashboard" className="flex items-center gap-2 mb-6">
              <span className="bg-blue-600 h-8 w-8 rounded-md flex items-center justify-center">
                <span className="bg-gray-200 h-4 w-4 rounded-full"></span>
              </span>
              <span className="font-bold text-xl">Attendez</span>
            </Link>
          </div>
          <DashboardNav
            user={{
              id: session.user.id || "",
              name: session.user.name || "",
              email: session.user.email || "",
              role: session.user.role || "STUDENT",
            }}
          />
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 border-b bg-white">
            <div className="flex h-16 items-center justify-end px-8">
              <div className="flex items-center gap-5">
                <button className="text-gray-500 hover:text-gray-700">
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
                    className="w-6 h-6"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </button>
                <UserAccountNav
                  user={{
                    id: session.user.id || "",
                    name: session.user.name || "",
                    email: session.user.email || "",
                    role: session.user.role || "STUDENT",
                  }}
                />
              </div>
            </div>
          </header>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
