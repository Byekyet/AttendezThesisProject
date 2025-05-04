"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.variable} font-sans`}>
        <SessionProvider>
          <ToastProvider>
            {children}
            <Toaster position="top-right" />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
