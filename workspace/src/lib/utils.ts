import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { ServiceType, AppointmentStatus } from "./data/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy");
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
}

export function formatTime(dateString: string): string {
  return format(new Date(dateString), "h:mm a");
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatServiceType(service: ServiceType): string {
  const map: Record<ServiceType, string> = {
    manicure: "Manicure",
    pedicure: "Pedicure",
    "gel-manicure": "Gel Manicure",
    "gel-pedicure": "Gel Pedicure",
    "acrylic-full": "Acrylic Full Set",
    "acrylic-fill": "Acrylic Fill",
    "nail-art": "Nail Art",
    "nail-repair": "Nail Repair",
    "combo-mani-pedi": "Mani & Pedi Combo",
  };
  return map[service] ?? service;
}

export function formatNailStyle(style: string): string {
  return style
    .charAt(0)
    .toUpperCase()
    .concat(style.slice(1).replace(/-/g, " "));
}

export function getStatusColor(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    scheduled: "border-blue-400",
    completed: "border-emerald-400",
    cancelled: "border-neutral-300",
    "no-show": "border-rose-400",
  };
  return map[status];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
