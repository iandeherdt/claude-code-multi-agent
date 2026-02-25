"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Customer, CreateCustomerPayload, NailStyle } from "@/lib/data/types";
import { formatNailStyle } from "@/lib/utils";

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

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  preferredNailStyle: z.enum([
    "natural",
    "gel",
    "acrylic",
    "dip-powder",
    "nail-art",
    "french",
    "ombre",
    "chrome",
  ] as const),
  allergies: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialValues?: Partial<Customer>;
  onSubmit: (payload: CreateCustomerPayload) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function CustomerForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      preferredNailStyle: initialValues?.preferredNailStyle ?? "gel",
      allergies: initialValues?.allergies ?? "",
      notes: initialValues?.notes ?? "",
    },
  });

  const handleSubmit = async (values: CustomerFormValues) => {
    await onSubmit({
      name: values.name,
      email: values.email,
      phone: values.phone,
      preferredNailStyle: values.preferredNailStyle,
      allergies: values.allergies ?? "",
      notes: values.notes ?? "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Sofia Ramirez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="555-0101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="sofia@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredNailStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Nail Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nail style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {nailStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {formatNailStyle(style)}
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
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergies / Sensitivities</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="E.g. Sensitive to acetone, latex allergy..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stylist Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="General notes about this customer's preferences..."
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
            {isLoading ? "Saving..." : "Save Customer"}
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
