import { requireRole } from "@/lib/auth"
import { db } from "@/db"
import { documentRequests, residents } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { ResidentDocumentsClient } from "@/components/resident/resident-documents-client"

async function getMyRequests(userId: string) {
  const [resident] = await db
    .select({ id: residents.id })
    .from(residents)
    .where(eq(residents.userId, userId))
    .limit(1)

  if (!resident) return []

  return db
    .select()
    .from(documentRequests)
    .where(eq(documentRequests.residentId, resident.id))
    .orderBy(desc(documentRequests.createdAt))
}

export default async function ResidentDocumentsPage() {
  const user = await requireRole("resident")
  const requests = await getMyRequests(user.id)

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Services
        </p>
        <h1 className="text-xl font-bold">My Documents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Request and track your barangay documents.
        </p>
      </div>
      <ResidentDocumentsClient requests={requests} />
    </div>
  )
}