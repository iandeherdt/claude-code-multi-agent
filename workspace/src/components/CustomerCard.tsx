import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Customer } from "@/lib/data/types";
import { getInitials, formatNailStyle, formatDate } from "@/lib/utils";
import { Phone, Mail, Calendar } from "lucide-react";

interface CustomerCardProps {
  customer: Customer;
  appointmentCount?: number;
  lastVisit?: string;
  onClick?: () => void;
}

export default function CustomerCard({
  customer,
  appointmentCount,
  lastVisit,
  onClick,
}: CustomerCardProps) {
  return (
    <Card
      className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 hover:border-brand-300 hover:shadow-md cursor-pointer transition-all"
      onClick={onClick}
    >
      <Avatar className="w-12 h-12 shrink-0">
        <AvatarFallback className="bg-brand-200 text-brand-700 font-semibold text-sm">
          {getInitials(customer.name)}
        </AvatarFallback>
      </Avatar>
      <CardContent className="flex-1 p-0 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-neutral-800 truncate">
              {customer.name}
            </p>
            <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
              <Phone className="w-3 h-3 shrink-0" />
              <span>{customer.phone}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge className="bg-brand-100 text-brand-700 border-transparent text-xs">
              {formatNailStyle(customer.preferredNailStyle)}
            </Badge>
            {appointmentCount !== undefined && (
              <span className="text-xs text-neutral-400">
                {appointmentCount} visit{appointmentCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        {lastVisit && (
          <div className="flex items-center gap-1 text-xs text-neutral-400 mt-1.5">
            <Calendar className="w-3 h-3" />
            <span>Last visit: {formatDate(lastVisit)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
