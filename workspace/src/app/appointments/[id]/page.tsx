"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { appointmentRepository } from "@/lib/repositories/appointmentRepository";
import { noteRepository } from "@/lib/repositories/noteRepository";
import {
  AppointmentWithCustomer,
  Note,
  CreateNotePayload,
} from "@/lib/data/types";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import NoteCard from "@/components/NoteCard";
import NoteForm from "@/components/NoteForm";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatServiceType,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import {
  User,
  Clock,
  DollarSign,
  CalendarDays,
  AlertTriangle,
  Plus,
  CheckCircle,
  XCircle,
  UserX,
  RefreshCw,
} from "lucide-react";

export default function AppointmentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [appointment, setAppointment] =
    useState<AppointmentWithCustomer | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteLoading, setIsNoteLoading] = useState(false);

  const load = useCallback(async () => {
    const [apptData, notesData] = await Promise.all([
      appointmentRepository.findById(id),
      noteRepository.findByAppointmentId(id),
    ]);
    if (!apptData) {
      setNotFound(true);
      return;
    }
    setAppointment(apptData);
    setNotes(notesData);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (
    status: "completed" | "cancelled" | "no-show"
  ) => {
    try {
      await appointmentRepository.update(id, { status });
      await load();
      toast.success(`Appointment marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAddNote = async (payload: CreateNotePayload) => {
    setIsNoteLoading(true);
    try {
      const newNote = await noteRepository.create(payload);
      setNotes((prev) => [newNote, ...prev]);
      setShowNoteForm(false);
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    } finally {
      setIsNoteLoading(false);
    }
  };

  const handleEditNote = async (payload: CreateNotePayload) => {
    if (!editingNote) return;
    setIsNoteLoading(true);
    try {
      const updated = await noteRepository.update(
        editingNote.id,
        payload.content
      );
      if (updated) {
        setNotes((prev) =>
          prev.map((n) => (n.id === editingNote.id ? updated : n))
        );
      }
      setEditingNote(null);
      toast.success("Note updated");
    } catch {
      toast.error("Failed to update note");
    } finally {
      setIsNoteLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteRepository.delete(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-neutral-500">
        <AlertTriangle className="w-12 h-12 text-brand-400" />
        <p className="text-xl font-semibold text-neutral-700">
          Appointment not found
        </p>
        <Link href="/appointments">
          <Button variant="outline">Back to Appointments</Button>
        </Link>
      </div>
    );
  }

  if (!appointment) {
    return <div className="p-8 text-center text-neutral-400">Loading...</div>;
  }

  return (
    <div>
      <PageHeader
        title={formatServiceType(appointment.serviceType)}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Appointments", href: "/appointments" },
          { label: formatDate(appointment.dateTime) },
        ]}
      />

      <div className="p-4 md:p-8 space-y-6 max-w-3xl">
        {/* Appointment detail card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-800">
                {formatServiceType(appointment.serviceType)}
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                {formatDateTime(appointment.dateTime)}
              </p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-100">
            <div>
              <p className="text-xs text-neutral-400 mb-1">Customer</p>
              <Link
                href={`/customers/${appointment.customerId}`}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800"
              >
                <User className="w-3.5 h-3.5" />
                {appointment.customer.name}
              </Link>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Duration</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {appointment.duration} min
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Price</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
                {formatCurrency(appointment.totalPrice)}
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-1">Booked</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
                {formatDate(appointment.createdAt)}
              </div>
            </div>
          </div>

          {appointment.notes && (
            <div className="pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-400 mb-1">Notes</p>
              <p className="text-sm text-neutral-700">{appointment.notes}</p>
            </div>
          )}

          {/* Status actions */}
          {appointment.status === "scheduled" && (
            <div className="pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-400 mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
                  onClick={() => handleStatusChange("completed")}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mark Completed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
                  onClick={() => handleStatusChange("no-show")}
                >
                  <UserX className="w-3.5 h-3.5" />
                  Mark No-Show
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-neutral-600 gap-1.5"
                  onClick={() => handleStatusChange("cancelled")}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {(appointment.status === "cancelled" ||
            appointment.status === "no-show") && (
            <div className="pt-4 border-t border-neutral-100">
              <Link
                href={`/appointments/new?customerId=${appointment.customerId}`}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-brand-600 border-brand-200 hover:bg-brand-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reschedule
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Notes section */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-700">
              Treatment Notes ({notes.length})
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowNoteForm(true);
                setEditingNote(null);
              }}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Note
            </Button>
          </div>

          {showNoteForm && !editingNote && (
            <div className="mb-4">
              <NoteForm
                appointmentId={id}
                customerId={appointment.customerId}
                onSubmit={handleAddNote}
                onCancel={() => setShowNoteForm(false)}
                isLoading={isNoteLoading}
              />
            </div>
          )}

          {notes.length === 0 && !showNoteForm ? (
            <p className="text-sm text-neutral-400 text-center py-8">
              No notes yet for this appointment.
            </p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id}>
                  {editingNote?.id === note.id ? (
                    <div className="bg-white rounded-xl border border-neutral-200 p-4">
                      <NoteForm
                        appointmentId={note.appointmentId}
                        customerId={note.customerId}
                        initialContent={note.content}
                        onSubmit={handleEditNote}
                        onCancel={() => setEditingNote(null)}
                        isLoading={isNoteLoading}
                      />
                    </div>
                  ) : (
                    <NoteCard
                      note={note}
                      onEdit={(n) => {
                        setEditingNote(n);
                        setShowNoteForm(false);
                      }}
                      onDelete={handleDeleteNote}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
