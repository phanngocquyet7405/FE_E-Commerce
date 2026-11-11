import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/format";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  growth?: number;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  growth,
  iconBgColor = "bg-indigo-50",
  iconColor = "text-indigo-600",
}: StatsCardProps) {
  const isPositive = growth !== undefined ? growth >= 0 : true;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              {title}
            </p>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {value}
            </h3>
          </div>
          <div
            className={cn(
              "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0",
              iconBgColor
            )}
          >
            <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)} />
          </div>
        </div>

        {(description || growth !== undefined) && (
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
            {growth !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center font-semibold px-2 py-0.5 rounded-full shrink-0",
                  isPositive
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                )}
              >
                {isPositive ? `+${growth}%` : `${growth}%`}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground truncate">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatsCard;
