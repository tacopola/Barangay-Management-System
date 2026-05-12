import { requireRole } from "@/lib/auth"
import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRole("super_admin")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SuperAdminSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}