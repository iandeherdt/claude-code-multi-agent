import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Glamour Nails — Salon Management",
  description:
    "Appointment and customer management for Glamour Nails salon",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-brand-50">
          <Navigation />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
