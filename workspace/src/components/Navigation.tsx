"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, CalendarDays, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Appointments", href: "/appointments", icon: CalendarCheck },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-neutral-200 shadow-sm">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-neutral-100">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-neutral-800 tracking-tight">
            Glamour Nails
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  active
                    ? "bg-brand-100 text-brand-700 font-semibold"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">Salon Management v1.0</p>
        </div>
      </aside>

      {/* Bottom nav — mobile */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-all",
                active
                  ? "text-brand-600 font-semibold"
                  : "text-neutral-400 hover:text-neutral-700"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  active ? "text-brand-600" : "text-neutral-400"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
