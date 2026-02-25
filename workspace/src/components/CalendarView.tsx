"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AppointmentWithCustomer } from "@/lib/data/types";
import AppointmentCard from "./AppointmentCard";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  appointments: AppointmentWithCustomer[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onAppointmentClick: (appointment: AppointmentWithCustomer) => void;
  onDayClick?: (date: Date) => void;
}

const statusDotColor: Record<string, string> = {
  scheduled: "bg-blue-400",
  completed: "bg-emerald-400",
  cancelled: "bg-neutral-300",
  "no-show": "bg-rose-400",
};

export default function CalendarView({
  appointments,
  currentMonth,
  onMonthChange,
  onAppointmentClick,
}: CalendarViewProps) {
  const [openDay, setOpenDay] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getAppointmentsForDay = (date: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.dateTime), date));

  const dayKeys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold text-neutral-800">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-neutral-200">
        {dayKeys.map((dk) => (
          <div
            key={dk}
            className="text-center text-xs font-medium text-neutral-400 py-2"
          >
            {dk}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-neutral-200">
        {days.map((d) => {
          const dayAppts = getAppointmentsForDay(d);
          const isCurrentMonth = isSameMonth(d, currentMonth);
          const isCurrentDay = isToday(d);
          const dayKey = d.toISOString();
          const isOpen = openDay === dayKey;

          return (
            <Popover
              key={dayKey}
              open={isOpen && dayAppts.length > 0}
              onOpenChange={(open) => {
                if (!open) setOpenDay(null);
              }}
            >
              <PopoverTrigger asChild>
                <div
                  className={cn(
                    "bg-white min-h-[80px] md:min-h-[100px] p-1 md:p-2 cursor-pointer hover:bg-brand-50 transition-colors",
                    !isCurrentMonth && "opacity-40",
                    isCurrentDay && "ring-2 ring-inset ring-brand-400"
                  )}
                  onClick={() => {
                    if (dayAppts.length > 0) {
                      setOpenDay(isOpen ? null : dayKey);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                      isCurrentDay
                        ? "bg-brand-500 text-white"
                        : "text-neutral-700"
                    )}
                  >
                    {format(d, "d")}
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {dayAppts.slice(0, 3).map((appt) => (
                      <span
                        key={appt.id}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full inline-block",
                          statusDotColor[appt.status] ?? "bg-neutral-400"
                        )}
                      />
                    ))}
                    {dayAppts.length > 3 && (
                      <span className="text-xs text-neutral-400">
                        +{dayAppts.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </PopoverTrigger>
              {dayAppts.length > 0 && (
                <PopoverContent
                  className="w-72 p-3 space-y-2"
                  align="start"
                  side="bottom"
                >
                  <p className="text-xs font-semibold text-neutral-500 mb-2">
                    {format(d, "EEEE, MMMM d")} — {dayAppts.length} appointment
                    {dayAppts.length !== 1 ? "s" : ""}
                  </p>
                  {dayAppts.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      compact
                      onClick={() => {
                        setOpenDay(null);
                        onAppointmentClick(appt);
                      }}
                    />
                  ))}
                </PopoverContent>
              )}
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
