import { Suspense } from "react";

import { SettingsPage } from "@/components/settings/settings-page";

export default function InstructorSettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPage role="instructor" />
    </Suspense>
  );
}
