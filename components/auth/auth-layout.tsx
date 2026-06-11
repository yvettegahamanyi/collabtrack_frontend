import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Decorative brand glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-secondary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-secondary/30 blur-3xl" />
      <div className={cn("relative z-10 w-full max-w-md", className)}>
        {children}
      </div>
    </div>
  );
}
