import { requireDepartmentAdminOf } from "@/lib/auth-helper";
import { MayorDashboardClient } from "@/components/department-admin/mayor_office/mayor-dashboard-client";

export default async function MayorOfficeDashboardPage() {
  const { admin } = await requireDepartmentAdminOf("mayor_office");

  const stats = {
    pendingDocuments: 0,
    todayAppointments: 0,
    unreadCorrespondence: 0,
    activeAnnouncements: 0,
  };

  return <MayorDashboardClient stats={stats} admin={admin} />;
}
