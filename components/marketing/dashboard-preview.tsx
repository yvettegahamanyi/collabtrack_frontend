import { BarChart3Icon, GitBranchIcon, MessageSquareIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface DashboardPreviewProps {
  className?: string;
  size?: "sm" | "lg";
}

export function DashboardPreview({
  className,
  size = "lg",
}: DashboardPreviewProps) {
  const compact = size === "sm";

  return (
    <div
      className={cn(
        "surface-card overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-2xl ring-1 ring-foreground/5 backdrop-blur-sm",
        compact ? "p-3" : "p-4 sm:p-5",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 border-b border-border/60 pb-3">
        <div className="size-2.5 rounded-full bg-destructive/80" />
        <div className="size-2.5 rounded-full bg-warning/80" />
        <div className="size-2.5 rounded-full bg-success/80" />
        <span className="ml-2 text-xs text-muted-foreground">
          CollabTrack Dashboard
        </span>
      </div>

      <div className={cn("flex gap-3", compact ? "min-h-[160px]" : "min-h-[220px]")}>
        <div
          className={cn(
            "shrink-0 space-y-2 rounded-xl bg-sidebar p-2",
            compact ? "w-14" : "w-20"
          )}
        >
          <div className="h-2 w-full rounded bg-sidebar-primary/30" />
          <div className="h-6 w-full rounded-lg bg-sidebar-primary/20" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <PreviewMetric
              label="Score"
              value="78%"
              tone="primary"
              compact={compact}
            />
            <PreviewMetric
              icon={GitBranchIcon}
              label="GitHub"
              value="42%"
              tone="github"
              compact={compact}
            />
            <PreviewMetric
              icon={MessageSquareIcon}
              label="Meetings"
              value="31%"
              tone="meeting"
              compact={compact}
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
              <BarChart3Icon className="size-3" />
              Group contribution comparison
            </div>
            <div className="flex items-end justify-between gap-1.5 px-1">
              {[65, 42, 78, 55].map((height, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end justify-center gap-0.5">
                    <span
                      className="w-1.5 rounded-t bg-primary/80"
                      style={{ height: `${height * 0.45}px` }}
                    />
                    <span
                      className="w-1.5 rounded-t bg-sky-500/70"
                      style={{ height: `${(height - 10) * 0.45}px` }}
                    />
                    <span
                      className="w-1.5 rounded-t bg-tertiary/80"
                      style={{ height: `${(height - 20) * 0.45}px` }}
                    />
                  </div>
                  <span className="text-[8px] text-muted-foreground">
                    M{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewMetric({
  icon: Icon,
  label,
  value,
  tone,
  compact,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "primary" | "github" | "meeting";
  compact: boolean;
}) {
  const toneClass = {
    primary: "from-primary/15 to-primary/5 text-primary",
    github: "from-emerald-500/15 to-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    meeting: "from-amber-500/15 to-amber-500/5 text-tertiary",
  }[tone];

  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-br p-2",
        toneClass,
        compact ? "space-y-0.5" : "space-y-1"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        {Icon ? (
          <Icon className={cn(compact ? "size-3" : "size-3.5")} />
        ) : (
          <span className="text-[9px] font-semibold uppercase opacity-70">
            {label}
          </span>
        )}
      </div>
      <p className={cn("font-bold tabular-nums", compact ? "text-sm" : "text-base")}>
        {value}
      </p>
      {Icon && (
        <p className="text-[9px] font-medium uppercase opacity-70">{label}</p>
      )}
    </div>
  );
}
