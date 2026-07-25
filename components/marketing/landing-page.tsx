import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { FeatureTimeline } from "@/components/marketing/feature-timeline";
import { HeroIllustration } from "@/components/marketing/hero-illustration";
import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/lib/constants";

const stats = [
  { label: "Data sources", value: "3+" },
  { label: "Role dashboards", value: "2" },
  { label: "Contribution reports", value: "Fast" },
];

export function LandingPage() {
  return (
    <div className="landing-hero-bg flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
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
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 space-y-8 duration-700">
            <div className="space-y-4">
              <h1 className="font-heading max-w-xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Track every contribution to your group work
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                {APP_NAME} helps students and instructors fairly measure and
                review individual contributions across GitHub, documents, and
                meetings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href={ROUTES.register} />}
              >
                Get started free
                <ArrowRightIcon />
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href={ROUTES.login} />}
              >
                Sign in
              </Button>
            </div>

            <div className="grid max-w-md grid-cols-3 gap-4 border-t border-border/60 pt-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-in fade-in-0 slide-in-from-bottom-6 fill-mode-both flex items-center justify-center delay-150 duration-700 lg:delay-300">
            <HeroIllustration />
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/20 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need for fair group grading
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                From syncing collaboration tools to generating contribution
                reports, {APP_NAME} keeps academic teams aligned.
              </p>
            </div>

            <FeatureTimeline />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="surface-card overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[#14233f] p-8 text-primary-foreground shadow-lg sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-xl space-y-3">
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                Ready to bring transparency to your next group project?
              </h2>
              <p className="text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                Create an account in minutes and start tracking contributions
                with dashboards designed for students and instructors.
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="mt-6 shrink-0 lg:mt-0"
              nativeButton={false}
              render={<Link href={ROUTES.register} />}
            >
              Create your account
              <ArrowRightIcon />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {APP_NAME}
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href={ROUTES.privacy} className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href={ROUTES.terms} className="hover:text-foreground">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
