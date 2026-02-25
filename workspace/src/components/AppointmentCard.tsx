import { Card, CardContent } from "@/components/ui/card";
import { AppointmentWithCustomer } from "@/lib/data/types";
import {
  formatDateTime,
  formatServiceType,
  formatCurrency,
  getStatusColor,
  cn,
} from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import { Clock, User, DollarSign } from "lucide-react";

interface AppointmentCardProps {
  appointment: AppointmentWithCustomer;
  showCustomer?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export default function AppointmentCard({
  appointment,
  showCustomer = true,
  compact = false,
  onClick,
}: AppointmentCardProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "rounded-lg border-l-4 px-3 py-2 bg-white cursor-pointer hover:shadow-sm transition-shadow",
          getStatusColor(appointment.status)
        )}
        onClick={onClick}
      >
        <p className="text-xs font-medium text-neutral-700 truncate">
          {appointment.customer.name}
        </p>
        <p className="text-xs text-neutral-500">
          {formatServiceType(appointment.serviceType)}
        </p>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "rounded-xl border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer",
        getStatusColor(appointment.status)
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {showCustomer && (
              <div className="flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <p className="font-semibold text-neutral-800 text-sm truncate">
                  {appointment.customer.name}
                </p>
              </div>
            )}
            <p className="text-sm font-medium text-neutral-700">
              {formatServiceType(appointment.serviceType)}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {formatDateTime(appointment.dateTime)}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Clock className="w-3 h-3" />
                <span>{appointment.duration} min</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <DollarSign className="w-3 h-3" />
                <span>{formatCurrency(appointment.totalPrice)}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
      </CardContent>
    </Card>
  );
}
