"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { customerRepository } from "@/lib/repositories/customerRepository";
import { CreateCustomerPayload } from "@/lib/data/types";
import PageHeader from "@/components/PageHeader";
import CustomerForm from "@/components/CustomerForm";

export default function NewCustomerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (payload: CreateCustomerPayload) => {
    setIsLoading(true);
    try {
      const newCustomer = await customerRepository.create(payload);
      toast.success("Customer created successfully");
      router.push(`/customers/${newCustomer.id}`);
    } catch {
      toast.error("Failed to create customer");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/customers");
  };

  return (
    <div>
      <PageHeader
        title="New Customer"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Customers", href: "/customers" },
          { label: "New Customer" },
        ]}
      />
      <div className="p-4 md:p-8 max-w-2xl">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <CustomerForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
