"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { customerRepository } from "@/lib/repositories/customerRepository";
import { appointmentRepository } from "@/lib/repositories/appointmentRepository";
import { Customer, NailStyle } from "@/lib/data/types";
import PageHeader from "@/components/PageHeader";
import CustomerCard from "@/components/CustomerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNailStyle } from "@/lib/utils";
import { UserPlus, Search } from "lucide-react";

const nailStyles: NailStyle[] = [
  "natural",
  "gel",
  "acrylic",
  "dip-powder",
  "nail-art",
  "french",
  "ombre",
  "chrome",
];

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [appointmentCounts, setAppointmentCounts] = useState<
    Record<string, number>
  >({});
  const [lastVisits, setLastVisits] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const [allCustomers, allAppointments] = await Promise.all([
        customerRepository.findAll(),
        appointmentRepository.findAll(),
      ]);
      setCustomers(allCustomers);

      const counts: Record<string, number> = {};
      const visits: Record<string, string> = {};
      allCustomers.forEach((c) => {
        const appts = allAppointments.filter((a) => a.customerId === c.id);
        counts[c.id] = appts.length;
        const completed = appts.filter((a) => a.status === "completed");
        if (completed.length > 0) {
          // Already sorted desc
          visits[c.id] = completed[0].dateTime;
        }
      });
      setAppointmentCounts(counts);
      setLastVisits(visits);
    };
    load();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q);
    const matchStyle =
      styleFilter === "all" || c.preferredNailStyle === styleFilter;
    return matchSearch && matchStyle;
  });

  // Sort by name A-Z
  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader
        title="Customers"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Customers" }]}
        action={
          <Link href="/customers/new">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white gap-2">
              <UserPlus className="w-4 h-4" />
              New Customer
            </Button>
          </Link>
        }
      />

      <div className="p-4 md:p-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All styles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styles</SelectItem>
              {nailStyles.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatNailStyle(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-neutral-500">
          {sorted.length} customer{sorted.length !== 1 ? "s" : ""}
        </p>

        {/* Customer list */}
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm mt-1">Try adjusting your search filters</p>
            </div>
          ) : (
            sorted.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                appointmentCount={appointmentCounts[customer.id] ?? 0}
                lastVisit={lastVisits[customer.id]}
                onClick={() => router.push(`/customers/${customer.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
