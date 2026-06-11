import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  showWordmark?: boolean;
  size?: number;
  className?: string;
}

export function Logo({
  href = "/",
  showWordmark = true,
  size = 32,
  className,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/images/collabTrackLogo.png"
        alt={`${APP_NAME} logo`}
        width={size}
        height={size}
        priority
        className="h-auto w-auto"
        style={{ width: size, height: "auto" }}
      />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex">
      {content}
    </Link>
  );
}
