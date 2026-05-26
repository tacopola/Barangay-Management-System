import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type BlotterCase = {
  id: string;
  caseNumber: string;
  status: string;
  incidentDate: string;
  narrative: string;
  isEscalated: boolean;
};

const statusStyles: Record<string, string> = {
  filed: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  under_mediation: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  settled:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  escalated: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  dismissed: "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-100",
};

const statusLabel: Record<string, string> = {
  filed: "Filed",
  under_mediation: "Mediation",
  settled: "Settled",
  escalated: "Escalated",
  dismissed: "Dismissed",
};

export function RecentBlotter({ cases }: { cases: BlotterCase[] }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h2 className="text-sm font-semibold">Blotter Cases</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recent incidents filed
          </p>
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
            <div
              key={c.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{c.caseNumber}</p>

                  {c.isEscalated && (
                    <span className="text-[10px] text-red-600 font-medium">
                      ↑ Escalated
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-55">
                  {c.narrative}
                </p>
              </div>

              <Badge
                variant="outline"
                className={`text-[10px] ml-3 shrink-0 capitalize ${
                  statusStyles[c.status] ??
                  "bg-muted text-muted-foreground border-border"
                }`}
              >
                {statusLabel[c.status] ?? c.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
