"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CreateNotePayload } from "@/lib/data/types";

const noteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface NoteFormProps {
  appointmentId: string;
  customerId: string;
  initialContent?: string;
  onSubmit: (payload: CreateNotePayload) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function NoteForm({
  appointmentId,
  customerId,
  initialContent = "",
  onSubmit,
  onCancel,
  isLoading = false,
}: NoteFormProps) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  const handleSubmit = async (values: NoteFormValues) => {
    await onSubmit({
      appointmentId,
      customerId,
      content: values.content,
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Add a note about this appointment..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={isLoading}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            {isLoading ? "Saving..." : "Save Note"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
