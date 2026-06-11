import { BookOpen, FolderKanban, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader
        title="Admin overview"
        description="Manage users, courses, and monitor contribution activity across CollabTrack."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total users" value="—" icon={Users} hint="Students & instructors" />
        <StatCard label="Active courses" value="—" icon={BookOpen} />
        <StatCard label="Group projects" value="—" icon={FolderKanban} />
      </div>
    </>
  );
}
