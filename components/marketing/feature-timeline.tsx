import {
  BarChart3,
  BookOpenIcon,
  FolderKanban,
  MicIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const features = [
  {
    icon: FolderKanban,
    title: "Group Projects",
    description:
      "Organize teams around courses and projects in one shared workspace.",
  },
  {
    icon: BookOpenIcon,
    title: "Classes & Assignments",
    description:
      "Organize teams around classes and assignments in one workspace.",
  },
  {
    icon: MicIcon,
    title: "Meeting Transcripts Generation",
    description:
      "Generate your meeting transcripts using the CollabTrack extension.",
  },
  {
    icon: BarChart3,
    title: "Contribution Tracking",
    description:
      "Log and visualize who did what, so effort is fairly recognized.",
  },
];

export function FeatureTimeline({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto max-w-2xl", className)}>
      <div
        aria-hidden
        className="absolute top-3 bottom-3 left-[11px] w-px bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10"
      />

      <ul className="space-y-0">
        {features.map((feature, index) => (
          <li
            key={feature.title}
            className={cn(
              "animate-in fade-in-0 slide-in-from-left-2 fill-mode-both relative pl-12",
              index !== features.length - 1 && "pb-14"
            )}
            style={{ animationDelay: `${150 + index * 120}ms` }}
          >
            <span
              aria-hidden
              className="absolute top-1 left-0 flex size-[22px] items-center justify-center rounded-full border-2 border-primary bg-background shadow-sm ring-4 ring-background"
            >
              <span className="size-2 rounded-full bg-primary" />
            </span>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-4" />
                </span>
                <p className="text-xs font-semibold tracking-wide text-primary/70 uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
              </div>

              <h3 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {feature.title}
              </h3>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                {feature.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { features as landingFeatures };
