"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { customerRepository } from "@/lib/repositories/customerRepository";
import { noteRepository } from "@/lib/repositories/noteRepository";
import {
  CustomerWithHistory,
  Note,
  CreateNotePayload,
  CreateCustomerPayload,
  AppointmentWithCustomer,
} from "@/lib/data/types";
import PageHeader from "@/components/PageHeader";
import AppointmentCard from "@/components/AppointmentCard";
import NoteCard from "@/components/NoteCard";
import NoteForm from "@/components/NoteForm";
import CustomerForm from "@/components/CustomerForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatNailStyle, formatDate, getInitials } from "@/lib/utils";
import {
  Mail,
  Phone,
  Calendar,
  Plus,
  Pencil,
  AlertTriangle,
} from "lucide-react";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<CustomerWithHistory | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const load = useCallback(async () => {
    const data = await customerRepository.findWithHistory(id);
    if (!data) {
      setNotFound(true);
      return;
    }
    setCustomer(data);
    setNotes(data.notes);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-neutral-500">
        <AlertTriangle className="w-12 h-12 text-brand-400" />
        <p className="text-xl font-semibold text-neutral-700">
          Customer not found
        </p>
        <Link href="/customers">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-neutral-400">Loading...</div>
    );
  }

  const now = new Date();
  const upcomingAppts: AppointmentWithCustomer[] = customer.appointments
    .filter(
      (a) =>
        a.status === "scheduled" && new Date(a.dateTime).getTime() > now.getTime()
    )
    .map((a) => ({ ...a, customer }))
    .sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

  const pastAppts: AppointmentWithCustomer[] = customer.appointments
    .filter(
      (a) =>
        a.status !== "scheduled" || new Date(a.dateTime).getTime() <= now.getTime()
    )
    .map((a) => ({ ...a, customer }))
    .sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

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

  const handleEditCustomer = async (payload: CreateCustomerPayload) => {
    setIsEditLoading(true);
    try {
      await customerRepository.update(id, payload);
      await load();
      setShowEditDialog(false);
      toast.success("Customer updated");
    } catch {
      toast.error("Failed to update customer");
    } finally {
      setIsEditLoading(false);
    }
  };

  // Get the first appointment id for note form (use oldest appointment or create dummy)
  const firstApptId = customer.appointments[0]?.id ?? "manual";

  return (
    <div>
      <PageHeader
        title={customer.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Customers", href: "/customers" },
          { label: customer.name },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Link href={`/appointments/new?customerId=${id}`}>
              <Button
                size="sm"
                className="bg-brand-500 hover:bg-brand-600 text-white gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Appointment
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-4 md:p-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">
              History ({customer.appointments.length})
            </TabsTrigger>
            <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-brand-200 text-brand-700 text-xl font-bold">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-800">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Customer since {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    {customer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    {customer.appointments.length} total appointment
                    {customer.appointments.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
                <h3 className="font-semibold text-neutral-700">Preferences</h3>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">
                    Preferred Style
                  </p>
                  <Badge className="bg-brand-100 text-brand-700 border-transparent">
                    {formatNailStyle(customer.preferredNailStyle)}
                  </Badge>
                </div>
                {customer.allergies && (
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">
                      Allergies / Sensitivities
                    </p>
                    <p className="text-sm text-rose-600 font-medium">
                      {customer.allergies}
                    </p>
                  </div>
                )}
                {customer.notes && (
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">
                      Stylist Notes
                    </p>
                    <p className="text-sm text-neutral-600">{customer.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming appointments */}
            {upcomingAppts.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-700 mb-3">
                  Upcoming Appointments
                </h3>
                <div className="space-y-3">
                  {upcomingAppts.map((appt) => (
                    <Link key={appt.id} href={`/appointments/${appt.id}`}>
                      <AppointmentCard
                        appointment={appt}
                        showCustomer={false}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-3">
            {pastAppts.length === 0 ? (
              <p className="text-center text-neutral-400 py-12">
                No appointment history yet
              </p>
            ) : (
              pastAppts.map((appt) => (
                <Link key={appt.id} href={`/appointments/${appt.id}`}>
                  <AppointmentCard appointment={appt} showCustomer={false} />
                </Link>
              ))
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-700">
                Post-Treatment Notes
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

            {(showNoteForm && !editingNote) && (
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <NoteForm
                  appointmentId={firstApptId}
                  customerId={id}
                  onSubmit={handleAddNote}
                  onCancel={() => setShowNoteForm(false)}
                  isLoading={isNoteLoading}
                />
              </div>
            )}

            {notes.length === 0 && !showNoteForm ? (
              <p className="text-center text-neutral-400 py-12">
                No notes yet. Add a note to track this customer&apos;s preferences.
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            initialValues={customer}
            onSubmit={handleEditCustomer}
            onCancel={() => setShowEditDialog(false)}
            isLoading={isEditLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
