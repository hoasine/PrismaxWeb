"use client";

import { AdminGate, AdminLayout } from "@/components/AdminShell";
import { SpotlightIntake } from "@/components/SpotlightIntake";

export default function AdminPage() {
  return (
    <AdminLayout active="intake">
      <AdminGate
        title="Spotlight intake"
        description="Paste Discord / X highlight lists here instead of sending them to Cursor. Protected by admin secret."
      >
        {(secret) => <SpotlightIntake secret={secret} />}
      </AdminGate>
    </AdminLayout>
  );
}
