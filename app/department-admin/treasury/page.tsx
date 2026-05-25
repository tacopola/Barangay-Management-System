import { LogoutButton } from "@/components/auth/logout-admin-button";
export default function TreasuryDashboardPage() {
  return (
    <div className="p-6">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
        Department Admin
      </p>

      <h1 className="text-2xl font-semibold tracking-tight">
        Treasury Dashboard
      </h1>

      <p className="text-sm text-muted-foreground mt-1">
        Manage treasury operations, collections, and reports.
      </p>
      <LogoutButton />
    </div>
  );
}
