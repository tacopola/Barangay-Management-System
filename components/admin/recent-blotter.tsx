import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

type BlotterCase = {
  id: string
  caseNumber: string
  status: string
  incidentDate: string
  narrative: string
  isEscalated: boolean
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  filed: "outline",
  under_mediation: "default",
  settled: "secondary",
  escalated: "destructive",
  dismissed: "secondary",
}

const statusLabel: Record<string, string> = {
  filed: "Filed",
  under_mediation: "Mediation",
  settled: "Settled",
  escalated: "Escalated",
  dismissed: "Dismissed",
}

export function RecentBlotter({ cases }: { cases: BlotterCase[] }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h2 className="text-sm font-semibold">Blotter Cases</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Recent incidents filed</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
          <Link href="/admin/blotter">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {cases.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No blotter cases yet
        </div>
      ) : (
        <div className="divide-y">
          {cases.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{c.caseNumber}</p>
                  {c.isEscalated && (
                    <span className="text-[10px] text-destructive font-medium">↑ Escalated</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-55">
                  {c.narrative}
                </p>
              </div>
              <Badge
                variant={statusVariant[c.status] ?? "outline"}
                className="text-[10px] ml-3 shrink-0"
              >
                {statusLabel[c.status] ?? c.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}