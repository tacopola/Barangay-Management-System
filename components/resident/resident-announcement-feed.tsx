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
      <h2 className="text-sm font-semibold mb-3">Announcements</h2>
      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="p-4 rounded-2xl border bg-card"
          >
            <div className="flex items-start gap-2">
              {a.isPinned && (
                <Pin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">
                  {a.body}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {new Date(a.createdAt).toLocaleDateString("en-PH", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}