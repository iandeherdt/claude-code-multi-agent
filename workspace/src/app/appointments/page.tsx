"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { appointmentRepository } from "@/lib/repositories/appointmentRepository";
import { AppointmentWithCustomer, AppointmentStatus } from "@/lib/data/types";
import PageHeader from "@/components/PageHeader";
import AppointmentCard from "@/components/AppointmentCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const statusTabs: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no-show", label: "No Show" },
];

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentWithCustomer[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<AppointmentStatus | "all">("all");

  useEffect(() => {
    const load = async () => {
      const data = await appointmentRepository.findAll();
      setAppointments(data);
    };
    load();
  }, []);

  const filtered =
    activeTab === "all"
      ? appointments
      : appointments.filter((a) => a.status === activeTab);

  return (
    <div>
      <PageHeader
        title="Appointments"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Appointments" },
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

      <div className="p-4 md:p-8 space-y-6">
        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const count =
              tab.value === "all"
                ? appointments.length
                : appointments.filter((a) => a.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  activeTab === tab.value
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-brand-300"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-1.5 text-xs",
                    activeTab === tab.value
                      ? "text-brand-100"
                      : "text-neutral-400"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-neutral-500">
          {filtered.length} appointment{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Appointment list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <p className="text-lg font-medium">No appointments found</p>
            </div>
          ) : (
            filtered.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onClick={() => router.push(`/appointments/${appt.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
