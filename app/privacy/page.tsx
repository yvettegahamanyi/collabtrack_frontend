import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy-content";
import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Learn what data ${APP_NAME} collects, how it is used, and your privacy choices.`,
};

const sections = [
  { id: "introduction", label: "Introduction" },
  { id: "information-we-collect", label: "Information we collect" },
  { id: "how-we-use-information", label: "How we use information" },
  { id: "legal-bases", label: "Legal bases" },
  { id: "sharing", label: "Sharing" },
  { id: "third-party-services", label: "Third-party services" },
  { id: "security", label: "Security" },
  { id: "retention", label: "Retention" },
  { id: "your-rights", label: "Your rights" },
  { id: "international", label: "International transfers" },
  { id: "children", label: "Academic use" },
  { id: "changes", label: "Changes" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href={ROUTES.login} />}
            >
              Sign in
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={ROUTES.register} />}
            >
              Register
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 lg:py-14">
        <div className="mb-10 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            How {APP_NAME} collects, uses, and protects your information when
            you track group project contributions.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
          <nav aria-label="Privacy policy sections" className="hidden lg:block">
            <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              On this page
            </p>
            <ul className="space-y-2 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <PrivacyPolicyContent />
        </div>
      </main>

      <footer className="border-t px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {APP_NAME}
          </p>
          <div className="flex items-center gap-4">
            <Link href={ROUTES.home} className="hover:text-foreground">
              Home
            </Link>
            {/* <Link href={ROUTES.terms} className="hover:text-foreground">
              Terms of Service
            </Link> */}
            <Link href={ROUTES.login} className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
