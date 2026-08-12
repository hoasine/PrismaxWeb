"use client";

import { AdminGate, AdminLayout, SpotlightManage } from "@/components/AdminShell";

export default function AdminManagePage() {
  return (
    <AdminLayout active="manage">
      <AdminGate
        title="Manage dates"
        description="Sign in to hide or delete recognition dates from Hall of Honor."
      >
        {(secret) => <SpotlightManage secret={secret} />}
      </AdminGate>
    </AdminLayout>
  );
}
