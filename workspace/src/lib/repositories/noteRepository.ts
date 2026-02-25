import { notes } from "../data/fake-data";
import { Note, CreateNotePayload } from "../data/types";

export interface INoteRepository {
  findByAppointmentId(appointmentId: string): Promise<Note[]>;
  findByCustomerId(customerId: string): Promise<Note[]>;
  findById(id: string): Promise<Note | null>;
  create(payload: CreateNotePayload): Promise<Note>;
  update(id: string, content: string): Promise<Note | null>;
  delete(id: string): Promise<boolean>;
}

export class FakeNoteRepository implements INoteRepository {
  async findByAppointmentId(appointmentId: string): Promise<Note[]> {
    return notes
      .filter((n) => n.appointmentId === appointmentId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async findByCustomerId(customerId: string): Promise<Note[]> {
    return notes
      .filter((n) => n.customerId === customerId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async findById(id: string): Promise<Note | null> {
    return notes.find((n) => n.id === id) ?? null;
  }

  async create(payload: CreateNotePayload): Promise<Note> {
    const newNote: Note = {
      ...payload,
      id: `n${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    notes.push(newNote);
    return newNote;
  }

  async update(id: string, content: string): Promise<Note | null> {
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return null;
    notes[index] = { ...notes[index], content };
    return notes[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return false;
    notes.splice(index, 1);
    return true;
  }
}

export const noteRepository = new FakeNoteRepository();
