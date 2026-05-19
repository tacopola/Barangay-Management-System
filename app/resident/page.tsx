import { db } from "@/db";
import {
  residents,
  documentRequests,
  blotterCases,
  announcements,
} from "@/db/schema";
import { eq, and, desc, isNull, or, gt } from "drizzle-orm";
import { ResidentQuickActions } from "@/components/resident/resident-quick-actions";
import { ResidentAnnouncementFeed } from "@/components/resident/resident-announcement-feed";
import { ResidentStatusCards } from "@/components/resident/resident-status-cards";
import { CheckCircle2, Clock } from "lucide-react";
import { requireResident } from "@/lib/auth-helper";

async function getResidentData(userId: string, barangayId: string) {
  const [resident] = await db
    .select()
    .from(residents)
    .where(eq(residents.userId, userId))
    .limit(1);

  if (!resident) return null;

  const recentDocs = await db
    .select()
    .from(documentRequests)
    .where(eq(documentRequests.residentId, resident.id))
    .orderBy(desc(documentRequests.createdAt))
    .limit(3);

  const recentBlotter = await db
    .select()
    .from(blotterCases)
    .where(eq(blotterCases.complainantId, resident.id))
    .orderBy(desc(blotterCases.createdAt))
    .limit(2);

  const feed = await db
    .select()
    .from(announcements)
    .where(
      and(
        or(
          eq(announcements.barangayId, barangayId),
          isNull(announcements.barangayId),
        ),
        or(
          isNull(announcements.expiresAt),
          gt(announcements.expiresAt, new Date()),
        ),
      ),
    )
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
    .limit(10);

  return { resident, recentDocs, recentBlotter, feed };
}

export default async function ResidentHomePage() {
  const { resident, barangayId } = await requireResident();
  const data = await getResidentData(resident.id, barangayId);

  const isVerified = data?.resident?.isVerified ?? false;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="bg-linear-to-br from-primary via-primary/90 to-primary/80 px-5 pt-6 pb-8 relative overflow-hidden">
        {/* Decorative circles */}

        <p className="text-[11px] uppercase tracking-widest text-white/60 mb-1.5 font-medium">
          Welcome back
        </p>
        <h1 className="text-2xl font-bold text-white leading-tight mb-3">
          {resident.firstName} {resident.lastName}
        </h1>
        <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1.5">
          {isVerified ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-300" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-amber-300" />
          )}
          <span className="text-[11px] text-white/90 font-medium">
            {isVerified ? "Verified Resident" : "Pending Verification"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-7">
        {/* Quick actions */}
        <ResidentQuickActions />

        {/* Active requests */}
        {data &&
          (data.recentDocs.length > 0 || data.recentBlotter.length > 0) && (
            <ResidentStatusCards
              docs={data.recentDocs}
              blotter={data.recentBlotter}
            />
          )}

        {/* Announcements */}
        {data && data.feed.length > 0 && (
          <ResidentAnnouncementFeed announcements={data.feed} />
        )}
      </div>
    </div>
  );
}
