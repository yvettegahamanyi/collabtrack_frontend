import Image from "next/image";

import { cn } from "@/lib/utils";

interface HeroIllustrationProps {
  className?: string;
}

export function HeroIllustration({ className }: HeroIllustrationProps) {
  return (
    <Image
      src="/undraw_group-project_kow1.svg"
      alt="Students collaborating on a group project"
      width={965}
      height={624}
      priority
      className={cn("mx-auto h-auto w-full max-w-xl", className)}
    />
  );
}
