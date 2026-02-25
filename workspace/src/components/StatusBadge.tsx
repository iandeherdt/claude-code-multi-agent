import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-700 border-transparent",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 border-transparent",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-neutral-100 text-neutral-500 border-transparent",
  },
  "no-show": {
    label: "No Show",
    className: "bg-rose-100 text-rose-700 border-transparent",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge className={cn(config.className, className)}>{config.label}</Badge>
  );
}
