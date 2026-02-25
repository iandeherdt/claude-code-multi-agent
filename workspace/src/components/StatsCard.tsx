import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  variant?: "default" | "highlight";
}

export default function StatsCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-neutral-200 shadow-sm",
        variant === "highlight" && "bg-brand-50 border-brand-200"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-neutral-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-neutral-800 mt-1">{value}</p>
            {description && (
              <p className="text-sm text-neutral-500 mt-1">{description}</p>
            )}
          </div>
          <div className="rounded-xl bg-brand-100 text-brand-600 p-2.5 shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
