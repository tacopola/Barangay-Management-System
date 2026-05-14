import Link from "next/link"
import { ArrowRight } from "lucide-react"

type DocRequest = {
  id: string
  docType: string
  status: string
  createdAt: Date
}

type BlotterCase = {
  id: string
  caseNumber: string
  status: string
}

const docTypeLabel: Record<string, string> = {
  barangay_clearance: "Barangay Clearance",
  certificate_of_residency: "Certificate of Residency",
  certificate_of_indigency: "Certificate of Indigency",
  barangay_id: "Barangay ID",
  business_clearance: "Business Clearance",
  good_moral_certificate: "Good Moral Certificate",
}

const statusStyle: Record<string, string> = {
  pending:        "bg-amber-50 text-amber-700 border-amber-200",
  approved:       "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected:       "bg-red-50 text-red-700 border-red-200",
  released:       "bg-blue-50 text-blue-700 border-blue-200",
  filed:          "bg-amber-50 text-amber-700 border-amber-200",
  under_mediation:"bg-blue-50 text-blue-700 border-blue-200",
  settled:        "bg-emerald-50 text-emerald-700 border-emerald-200",
  escalated:      "bg-red-50 text-red-700 border-red-200",
  dismissed:      "bg-muted text-muted-foreground border-border",
}

const statusLabel: Record<string, string> = {
  pending:        "Pending",
  approved:       "Approved",
  rejected:       "Rejected",
  released:       "Released",
  filed:          "Filed",
  under_mediation:"Mediation",
  settled:        "Settled",
  escalated:      "Escalated",
  dismissed:      "Dismissed",
}

export function ResidentStatusCards({
  docs,
  blotter,
}: {
  docs: DocRequest[]
  blotter: BlotterCase[]
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          My Requests
        </p>
        <Link
          href="/resident/documents"
          className="flex items-center gap-1 text-xs text-primary font-medium"
        >
          See all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {docs.map((doc) => (
          <Link
            key={doc.id}
            href="/resident/documents"
            className="flex items-center justify-between p-4 rounded-2xl border bg-card shadow-sm hover:bg-muted/20 active:scale-[0.98] transition-all duration-150"
          >
            <div className="min-w-0 mr-3">
              <p className="text-sm font-semibold truncate">
                {docTypeLabel[doc.docType] ?? doc.docType}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(doc.createdAt).toLocaleDateString("en-PH", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <span className={`shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-full border ${statusStyle[doc.status] ?? "bg-muted text-muted-foreground"}`}>
              {statusLabel[doc.status] ?? doc.status}
            </span>
          </Link>
        ))}

        {blotter.map((c) => (
          <Link
            key={c.id}
            href="/resident/blotter"
            className="flex items-center justify-between p-4 rounded-2xl border bg-card shadow-sm hover:bg-muted/20 active:scale-[0.98] transition-all duration-150"
          >
            <div className="min-w-0 mr-3">
              <p className="text-sm font-semibold">{c.caseNumber}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Blotter Case</p>
            </div>
            <span className={`shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-full border ${statusStyle[c.status] ?? "bg-muted text-muted-foreground"}`}>
              {statusLabel[c.status] ?? c.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}