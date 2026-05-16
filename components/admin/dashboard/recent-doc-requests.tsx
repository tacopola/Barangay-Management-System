import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

type DocRequest = {
  id: string
  docType: string
  status: string
  controlNumber: string | null
  createdAt: Date
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  released: "secondary",
}

const docTypeLabel: Record<string, string> = {
  barangay_clearance: "Barangay Clearance",
  certificate_of_residency: "Cert. of Residency",
  certificate_of_indigency: "Cert. of Indigency",
  barangay_id: "Barangay ID",
  business_clearance: "Business Clearance",
  good_moral_certificate: "Good Moral Cert.",
}

export function RecentDocRequests({ requests }: { requests: DocRequest[] }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h2 className="text-sm font-semibold">Document Requests</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Latest incoming requests</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
          <Link href="/admin/documents">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No document requests yet
        </div>
      ) : (
        <div className="divide-y">
          {requests.map((req) => (
            <div key={req.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {docTypeLabel[req.docType] ?? req.docType}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {req.controlNumber ?? "No control number"} ·{" "}
                  {new Date(req.createdAt).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Badge variant={statusVariant[req.status] ?? "outline"} className="text-[10px] capitalize ml-3 shrink-0">
                {req.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}