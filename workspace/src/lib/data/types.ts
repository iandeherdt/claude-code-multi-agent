export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no-show";

export type ServiceType =
  | "manicure"
  | "pedicure"
  | "gel-manicure"
  | "gel-pedicure"
  | "acrylic-full"
  | "acrylic-fill"
  | "nail-art"
  | "nail-repair"
  | "combo-mani-pedi";

export type NailStyle =
  | "natural"
  | "gel"
  | "acrylic"
  | "dip-powder"
  | "nail-art"
  | "french"
  | "ombre"
  | "chrome";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredNailStyle: NailStyle;
  allergies: string;
  notes: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  dateTime: string;
  duration: number;
  serviceType: ServiceType;
  status: AppointmentStatus;
  totalPrice: number;
  notes: string;
  createdAt: string;
}

export interface Note {
  id: string;
  appointmentId: string;
  customerId: string;
  content: string;
  createdAt: string;
}

export interface AppointmentWithCustomer extends Appointment {
  customer: Customer;
}

export interface CustomerWithHistory extends Customer {
  appointments: Appointment[];
  treatmentNotes: Note[];
}

export type CreateCustomerPayload = Omit<Customer, "id" | "createdAt">;
export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export type CreateAppointmentPayload = Omit<Appointment, "id" | "createdAt">;
export type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>;

export type CreateNotePayload = Omit<Note, "id" | "createdAt">;

export interface AppointmentFilters {
  customerId?: string;
  status?: AppointmentStatus;
  fromDate?: string;
  toDate?: string;
  serviceType?: ServiceType;
}

export interface CustomerFilters {
  search?: string;
  preferredNailStyle?: NailStyle;
}

export interface DashboardStats {
  totalCustomers: number;
  appointmentsThisMonth: number;
  upcomingAppointments: number;
  revenueThisMonth: number;
  completedThisMonth: number;
  cancellationsThisMonth: number;
}
