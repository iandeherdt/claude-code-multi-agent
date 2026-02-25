import Link from "next/link";
import { appointmentRepository } from "@/lib/repositories/appointmentRepository";
import { customerRepository } from "@/lib/repositories/customerRepository";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import AppointmentCard from "@/components/AppointmentCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  CalendarCheck,
  CalendarDays,
  DollarSign,
  TrendingUp,
  XCircle,
  Plus,
  UserPlus,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, upcoming, allCompleted, totalCustomersData] = await Promise.all([
    appointmentRepository.getStats(),
    appointmentRepository.findUpcoming(5),
    appointmentRepository.findAll({ status: "completed" }),
    customerRepository.findAll(),
  ]);

  const recentCompleted = allCompleted.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <Link href="/appointments/new">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              New Appointment
            </Button>
          </Link>
        }
      />

      <div className="p-4 md:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers}
            description={`${totalCustomersData.length} registered`}
            icon={<Users className="w-5 h-5" />}
          />
          <StatsCard
            title="This Month"
            value={stats.appointmentsThisMonth}
            description="Appointments scheduled"
            icon={<CalendarCheck className="w-5 h-5" />}
          />
          <StatsCard
            title="Upcoming"
            value={stats.upcomingAppointments}
            description="Future scheduled"
            icon={<CalendarDays className="w-5 h-5" />}
            variant="highlight"
          />
          <StatsCard
            title="Revenue"
            value={formatCurrency(stats.revenueThisMonth)}
            description="This month"
            icon={<DollarSign className="w-5 h-5" />}
            variant="highlight"
          />
          <StatsCard
            title="Completed"
            value={stats.completedThisMonth}
            description="This month"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatsCard
            title="Cancellations"
            value={stats.cancellationsThisMonth}
            description="Cancelled + no-shows"
            icon={<XCircle className="w-5 h-5" />}
          />
        </div>

        {/* Two column section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-800">
                Upcoming Appointments
              </h2>
              <Link
                href="/appointments"
                className="text-sm text-brand-500 hover:text-brand-700"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {upcoming.length === 0 ? (
                <p className="text-sm text-neutral-400 py-6 text-center">
                  No upcoming appointments
                </p>
              ) : (
                upcoming.map((appt) => (
                  <Link key={appt.id} href={`/appointments/${appt.id}`}>
                    <AppointmentCard appointment={appt} />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-800">
                Recent Activity
              </h2>
              <Link
                href="/appointments"
                className="text-sm text-brand-500 hover:text-brand-700"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentCompleted.length === 0 ? (
                <p className="text-sm text-neutral-400 py-6 text-center">
                  No recent activity
                </p>
              ) : (
                recentCompleted.map((appt) => (
                  <Link key={appt.id} href={`/appointments/${appt.id}`}>
                    <AppointmentCard appointment={appt} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/customers/new">
              <Button variant="outline" className="gap-2">
                <UserPlus className="w-4 h-4" />
                New Customer
              </Button>
            </Link>
            <Link href="/appointments/new">
              <Button
                className="gap-2 bg-brand-500 hover:bg-brand-600 text-white"
              >
                <Plus className="w-4 h-4" />
                New Appointment
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="outline" className="gap-2">
                <CalendarDays className="w-4 h-4" />
                View Calendar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
