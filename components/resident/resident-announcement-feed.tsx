import { Pin } from "lucide-react"

type Announcement = {
  id: string
  title: string
  body: string
  isPinned: boolean
  createdAt: Date
}

export function ResidentAnnouncementFeed({
  announcements,
}: {
  announcements: Announcement[]
}) {
  if (announcements.length === 0) return null

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        Announcements
      </p>
      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="p-4 rounded-2xl border bg-card shadow-sm"
          >
            {a.isPinned && (
              <div className="flex items-center gap-1.5 mb-2">
                <Pin className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                  Pinned
                </span>
              </div>
            )}
            <p className="text-sm font-bold leading-snug text-foreground">
              {a.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
              {a.body}
            </p>
            <p className="text-[10px] text-muted-foreground mt-3 font-medium">
              {new Date(a.createdAt).toLocaleDateString("en-PH", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}