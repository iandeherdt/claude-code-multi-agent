import { customers } from "../data/fake-data";
import { appointments, notes } from "../data/fake-data";
import {
  Customer,
  CustomerWithHistory,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomerFilters,
} from "../data/types";

export interface ICustomerRepository {
  findAll(filters?: CustomerFilters): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findWithHistory(id: string): Promise<CustomerWithHistory | null>;
  create(payload: CreateCustomerPayload): Promise<Customer>;
  update(id: string, payload: UpdateCustomerPayload): Promise<Customer | null>;
  delete(id: string): Promise<boolean>;
}

export class FakeCustomerRepository implements ICustomerRepository {
  async findAll(filters?: CustomerFilters): Promise<Customer[]> {
    let result = [...customers];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }
    if (filters?.preferredNailStyle) {
      result = result.filter(
        (c) => c.preferredNailStyle === filters.preferredNailStyle
      );
    }
    return result;
  }

  async findById(id: string): Promise<Customer | null> {
    return customers.find((c) => c.id === id) ?? null;
  }

  async findWithHistory(id: string): Promise<CustomerWithHistory | null> {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return null;
    const customerAppointments = appointments.filter(
      (a) => a.customerId === id
    );
    const customerNotes = notes.filter((n) => n.customerId === id);
    return {
      ...customer,
      appointments: customerAppointments,
      notes: customerNotes,
    };
  }

  async create(payload: CreateCustomerPayload): Promise<Customer> {
    const newCustomer: Customer = {
      ...payload,
      id: `c${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    return newCustomer;
  }

  async update(
    id: string,
    payload: UpdateCustomerPayload
  ): Promise<Customer | null> {
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) return null;
    customers[index] = { ...customers[index], ...payload };
    return customers[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) return false;
    customers.splice(index, 1);
    return true;
  }
}

export const customerRepository = new FakeCustomerRepository();
