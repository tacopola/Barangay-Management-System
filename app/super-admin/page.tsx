import { getSuperAdminStats, getAllBarangays } from "@/db/queries/super-admin/dashboard";
import { BarangayTable } from "@/components/super-admin/dashboard/barangay-table";

export default async function SuperAdminPage() {
  const [stats, allBarangays] = await Promise.all([
    getSuperAdminStats(),
    getAllBarangays(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Barangays"
          value={stats.totalBarangays}
          color="amber"
        />
        <StatCard
          label="Total Residents"
          value={stats.totalResidents.toLocaleString()}
          color="blue"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingDocs}
          color="green"
        />
        <StatCard
          label="Active Blotters"
          value={stats.activeBlotters}
          color="red"
        />
      </div>

      <BarangayTable barangays={allBarangays} />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "amber" | "blue" | "green" | "red";
}) {
  const accent = {
    amber: "border-t-amber-500",
    blue: "border-t-blue-500",
    green: "border-t-emerald-500",
    red: "border-t-red-500",
  }[color];

  return (
    <div className={`rounded-xl border bg-card p-5 border-t-2 ${accent}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-3xl font-light tracking-tight">{value}</p>
    </div>
  );
}
