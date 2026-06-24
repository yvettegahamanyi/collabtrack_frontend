import { Suspense } from "react";

import { SettingsPage } from "@/components/settings/settings-page";

export default function StudentSettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPage role="student" />
    </Suspense>
  );
}
