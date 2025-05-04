import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="fixed h-screen z-20">
        <Sidebar />
      </div>
      <div className="ml-[260px] flex-1 flex flex-col h-screen">
        <div className="fixed top-0 right-0 left-[260px] z-10">
          <Header title={title} />
        </div>
        <main className="pt-16 flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
