import { appointments, customers } from "../data/fake-data";
import {
  Appointment,
  AppointmentWithCustomer,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
  AppointmentFilters,
  DashboardStats,
} from "../data/types";

export interface IAppointmentRepository {
  findAll(filters?: AppointmentFilters): Promise<AppointmentWithCustomer[]>;
  findById(id: string): Promise<AppointmentWithCustomer | null>;
  findByCustomerId(customerId: string): Promise<Appointment[]>;
  findByDateRange(
    from: string,
    to: string
  ): Promise<AppointmentWithCustomer[]>;
  findUpcoming(limit?: number): Promise<AppointmentWithCustomer[]>;
  create(payload: CreateAppointmentPayload): Promise<Appointment>;
  update(
    id: string,
    payload: UpdateAppointmentPayload
  ): Promise<Appointment | null>;
  delete(id: string): Promise<boolean>;
  getStats(): Promise<DashboardStats>;
}

function enrichWithCustomer(
  appointment: Appointment
): AppointmentWithCustomer | null {
  const customer = customers.find((c) => c.id === appointment.customerId);
  if (!customer) return null;
  return { ...appointment, customer };
}

export class FakeAppointmentRepository implements IAppointmentRepository {
  async findAll(
    filters?: AppointmentFilters
  ): Promise<AppointmentWithCustomer[]> {
    let result = appointments
      .map(enrichWithCustomer)
      .filter((a): a is AppointmentWithCustomer => a !== null);

    if (filters?.customerId) {
      result = result.filter((a) => a.customerId === filters.customerId);
    }
    if (filters?.status) {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters?.fromDate) {
      const from = new Date(filters.fromDate).getTime();
      result = result.filter((a) => new Date(a.dateTime).getTime() >= from);
    }
    if (filters?.toDate) {
      const to = new Date(filters.toDate).getTime();
      result = result.filter((a) => new Date(a.dateTime).getTime() <= to);
    }
    if (filters?.serviceType) {
      result = result.filter((a) => a.serviceType === filters.serviceType);
    }

    return result.sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );
  }

  async findById(id: string): Promise<AppointmentWithCustomer | null> {
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return null;
    return enrichWithCustomer(appointment);
  }

  async findByCustomerId(customerId: string): Promise<Appointment[]> {
    return appointments
      .filter((a) => a.customerId === customerId)
      .sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );
  }

  async findByDateRange(
    from: string,
    to: string
  ): Promise<AppointmentWithCustomer[]> {
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    return appointments
      .filter((a) => {
        const t = new Date(a.dateTime).getTime();
        return t >= fromTime && t <= toTime;
      })
      .map(enrichWithCustomer)
      .filter((a): a is AppointmentWithCustomer => a !== null)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );
  }

  async findUpcoming(limit = 10): Promise<AppointmentWithCustomer[]> {
    const now = new Date().getTime();
    return appointments
      .filter(
        (a) => a.status === "scheduled" && new Date(a.dateTime).getTime() > now
      )
      .map(enrichWithCustomer)
      .filter((a): a is AppointmentWithCustomer => a !== null)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      )
      .slice(0, limit);
  }

  async create(payload: CreateAppointmentPayload): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...payload,
      id: `a${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    return newAppointment;
  }

  async update(
    id: string,
    payload: UpdateAppointmentPayload
  ): Promise<Appointment | null> {
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) return null;
    appointments[index] = { ...appointments[index], ...payload };
    return appointments[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) return false;
    appointments.splice(index, 1);
    return true;
  }

  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const thisMonthAppts = appointments.filter((a) => {
      const t = new Date(a.dateTime).getTime();
      return t >= startOfMonth.getTime() && t <= endOfMonth.getTime();
    });

    const upcomingAppts = appointments.filter(
      (a) =>
        a.status === "scheduled" && new Date(a.dateTime).getTime() > now.getTime()
    );

    const completedThisMonth = thisMonthAppts.filter(
      (a) => a.status === "completed"
    );

    const cancellationsThisMonth = thisMonthAppts.filter(
      (a) => a.status === "cancelled" || a.status === "no-show"
    );

    const revenueThisMonth = completedThisMonth.reduce(
      (sum, a) => sum + a.totalPrice,
      0
    );

    return {
      totalCustomers: customers.length,
      appointmentsThisMonth: thisMonthAppts.length,
      upcomingAppointments: upcomingAppts.length,
      revenueThisMonth,
      completedThisMonth: completedThisMonth.length,
      cancellationsThisMonth: cancellationsThisMonth.length,
    };
  }
}

export const appointmentRepository = new FakeAppointmentRepository();
