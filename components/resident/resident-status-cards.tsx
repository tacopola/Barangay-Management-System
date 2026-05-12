import Link from "next/link"
//import { Badge } from "@/components/ui/badge"
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

const statusColor: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-200",
  approved: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  rejected: "bg-red-500/10 text-red-700 border-red-200",
  released: "bg-blue-500/10 text-blue-700 border-blue-200",
  filed: "bg-amber-500/10 text-amber-700 border-amber-200",
  under_mediation: "bg-blue-500/10 text-blue-700 border-blue-200",
  settled: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  escalated: "bg-red-500/10 text-red-700 border-red-200",
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
        <h2 className="text-sm font-semibold">My Requests</h2>
        <Link href="/resident/documents" className="text-xs text-primary flex items-center gap-1">
          See all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {docs.map((doc) => (
          <Link
            key={doc.id}
            href={`/resident/documents`}
            className="flex items-center justify-between p-4 rounded-2xl border bg-card active:scale-[0.98] transition-transform"
          >
            <div>
              <p className="text-sm font-medium">
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
            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border capitalize ${statusColor[doc.status] ?? ""}`}>
              {doc.status}
            </span>
          </Link>
        ))}

        {blotter.map((c) => (
          <Link
            key={c.id}
            href={`/resident/blotter`}
            className="flex items-center justify-between p-4 rounded-2xl border bg-card active:scale-[0.98] transition-transform"
          >
            <div>
              <p className="text-sm font-medium">{c.caseNumber}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Blotter Case</p>
            </div>
            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border capitalize ${statusColor[c.status] ?? ""}`}>
              {c.status.replace("_", " ")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}