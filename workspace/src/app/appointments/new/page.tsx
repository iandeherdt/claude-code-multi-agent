"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { customerRepository } from "@/lib/repositories/customerRepository";
import { appointmentRepository } from "@/lib/repositories/appointmentRepository";
import { Customer, CreateAppointmentPayload } from "@/lib/data/types";
import PageHeader from "@/components/PageHeader";
import AppointmentForm from "@/components/AppointmentForm";

function NewAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId") ?? undefined;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    customerRepository.findAll().then(setCustomers);
  }, []);

  const handleSubmit = async (payload: CreateAppointmentPayload) => {
    setIsLoading(true);
    try {
      const newAppt = await appointmentRepository.create(payload);
      toast.success("Appointment booked successfully");
      router.push(`/appointments/${newAppt.id}`);
    } catch {
      toast.error("Failed to create appointment");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/appointments");
  };

  return (
    <div>
      <PageHeader
        title="New Appointment"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Appointments", href: "/appointments" },
          { label: "New Appointment" },
        ]}
      />
      <div className="p-4 md:p-8 max-w-2xl">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <AppointmentForm
            customers={customers}
            preselectedCustomerId={preselectedCustomerId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400">Loading...</div>}>
      <NewAppointmentContent />
    </Suspense>
  );
}
