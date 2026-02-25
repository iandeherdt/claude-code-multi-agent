"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { appointmentRepository } from "@/lib/repositories/appointmentRepository";
import { AppointmentWithCustomer } from "@/lib/data/types";
import PageHeader from "@/components/PageHeader";
import CalendarView from "@/components/CalendarView";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithCustomer[]>(
    []
  );

  const loadAppointments = useCallback(async (month: Date) => {
    const from = startOfMonth(month).toISOString();
    const to = endOfMonth(month).toISOString();
    const data = await appointmentRepository.findByDateRange(from, to);
    setAppointments(data);
  }, []);

  useEffect(() => {
    loadAppointments(currentMonth);
  }, [currentMonth, loadAppointments]);

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  const handleAppointmentClick = (appt: AppointmentWithCustomer) => {
    router.push(`/appointments/${appt.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Calendar"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Calendar" },
        ]}
        action={
          <Link href="/appointments/new">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              New Appointment
            </Button>
          </Link>
        }
      />

      <div className="p-4 md:p-8">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {[
            { status: "scheduled", color: "bg-blue-400", label: "Scheduled" },
            {
              status: "completed",
              color: "bg-emerald-400",
              label: "Completed",
            },
            { status: "cancelled", color: "bg-neutral-300", label: "Cancelled" },
            { status: "no-show", color: "bg-rose-400", label: "No Show" },
          ].map((item) => (
            <div key={item.status} className="flex items-center gap-1.5">
              <span
                className={`w-3 h-3 rounded-full ${item.color}`}
              />
              <span className="text-xs text-neutral-500">{item.label}</span>
            </div>
          ))}
        </div>

        <CalendarView
          appointments={appointments}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          onAppointmentClick={handleAppointmentClick}
        />
      </div>
    </div>
  );
}
