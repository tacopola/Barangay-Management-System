import { requireResident } from "@/lib/auth-helper"
import { ResidentBottomNav } from "@/components/resident/resident-bottom-nav"
import { ResidentTopBar } from "@/components/resident/resident-top-bar"

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { resident } = await requireResident()

  return (
    <div className="min-h-screen bg-muted/40">
      {/* On mobile: full width. On web: centered card feel */}
      <div className="mx-auto max-w-lg min-h-screen bg-background flex flex-col relative shadow-xl">
        <ResidentTopBar user={resident} />
        <main className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>
        <ResidentBottomNav />
      </div>
    </div>
  )
}