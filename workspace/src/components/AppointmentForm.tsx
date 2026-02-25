"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Customer,
  Appointment,
  CreateAppointmentPayload,
  ServiceType,
  AppointmentStatus,
} from "@/lib/data/types";
import { formatServiceType, cn } from "@/lib/utils";

const serviceTypes: ServiceType[] = [
  "manicure",
  "pedicure",
  "gel-manicure",
  "gel-pedicure",
  "acrylic-full",
  "acrylic-fill",
  "nail-art",
  "nail-repair",
  "combo-mani-pedi",
];

const timeSlots: string[] = [];
for (let h = 8; h <= 20; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 20 && m > 0) break;
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h >= 12 ? "PM" : "AM";
    const minStr = m.toString().padStart(2, "0");
    timeSlots.push(`${hour12}:${minStr} ${ampm}`);
  }
}

const appointmentSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, "Please select a time"),
  serviceType: z.enum([
    "manicure",
    "pedicure",
    "gel-manicure",
    "gel-pedicure",
    "acrylic-full",
    "acrylic-fill",
    "nail-art",
    "nail-repair",
    "combo-mani-pedi",
  ] as const),
  duration: z.string(),
  totalPrice: z.number().min(0, "Price must be 0 or greater"),
  notes: z.string().optional().default(""),
  status: z.enum(["scheduled", "completed", "cancelled", "no-show"] as const),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  customers: Customer[];
  initialValues?: Partial<Appointment>;
  preselectedCustomerId?: string;
  onSubmit: (payload: CreateAppointmentPayload) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

function parseTimeSlot(timeStr: string): { hours: number; minutes: number } {
  const [time, ampm] = timeStr.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hours = h;
  if (ampm === "PM" && h !== 12) hours += 12;
  if (ampm === "AM" && h === 12) hours = 0;
  return { hours, minutes: m };
}

export default function AppointmentForm({
  customers,
  initialValues,
  preselectedCustomerId,
  onSubmit,
  onCancel,
  isLoading = false,
}: AppointmentFormProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const getDefaultTime = () => {
    if (initialValues?.dateTime) {
      const d = new Date(initialValues.dateTime);
      const h = d.getHours();
      const m = d.getMinutes();
      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
    }
    return "10:00 AM";
  };

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerId:
        preselectedCustomerId ?? initialValues?.customerId ?? "",
      date: initialValues?.dateTime
        ? new Date(initialValues.dateTime)
        : new Date(),
      time: getDefaultTime(),
      serviceType: initialValues?.serviceType ?? "gel-manicure",
      duration: initialValues?.duration?.toString() ?? "60",
      totalPrice: initialValues?.totalPrice ?? 65,
      notes: initialValues?.notes ?? "",
      status: (initialValues?.status as AppointmentStatus) ?? "scheduled",
    },
  });

  const handleSubmit = async (values: AppointmentFormValues) => {
    const { hours, minutes } = parseTimeSlot(values.time);
    const dateTime = new Date(values.date);
    dateTime.setHours(hours, minutes, 0, 0);

    await onSubmit({
      customerId: values.customerId,
      dateTime: dateTime.toISOString(),
      duration: parseInt(values.duration),
      serviceType: values.serviceType,
      status: values.status,
      totalPrice: values.totalPrice,
      notes: values.notes ?? "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {serviceTypes.map((st) => (
                      <SelectItem key={st} value={st}>
                        {formatServiceType(st)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[30, 45, 60, 75, 90].map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="65.00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes / Special Requests</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requests or notes for this appointment..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            {isLoading ? "Saving..." : "Book Appointment"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
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
