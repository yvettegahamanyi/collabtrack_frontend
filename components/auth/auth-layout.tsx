import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
      <div
        className={cn(
          "animate-in fade-in-0 slide-in-from-bottom-4 w-full max-w-md duration-700",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
