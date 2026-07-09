import { cn } from "@/lib/utils";

export type DataTableStatusTone =
  | "success"
  | "danger"
  | "warning"
  | "neutral"
  | "info";

const toneStyles: Record<DataTableStatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  danger: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  neutral: "bg-muted text-muted-foreground",
  info: "bg-primary/10 text-primary",
};

interface DataTableStatusBadgeProps {
  label: string;
  tone?: DataTableStatusTone;
  className?: string;
}

export function DataTableStatusBadge({
  label,
  tone = "neutral",
  className,
}: DataTableStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        toneStyles[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
