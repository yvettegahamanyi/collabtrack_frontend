import { ArrowRightIcon, BarChart3, FolderKanban, Users } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME, ROUTES } from "@/lib/constants";

const features = [
  {
    icon: FolderKanban,
    title: "Group projects",
    description:
      "Organize teams around courses and projects in one shared workspace.",
  },
  {
    icon: BarChart3,
    title: "Contribution tracking",
    description:
      "Log and visualize who did what, so effort is fairly recognized.",
  },
  {
    icon: Users,
    title: "Built for everyone",
    description: "Tailored views for system instructors, and students.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <Logo />
        <div className="flex items-center gap-2">
          {/* <ThemeToggle /> */}
          <Button nativeButton={false} render={<Link href={ROUTES.login} />}>
            Sign in
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Track every contribution to your group work
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          {APP_NAME} helps students and instructors fairly measure and review
          individual contributions to group projects.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href={ROUTES.register} />}
          >
            Get started
            <ArrowRightIcon />
          </Button>
        </div>

        <div className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="text-left">
              <CardHeader>
                <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <feature.icon className="size-5" />
                </span>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
