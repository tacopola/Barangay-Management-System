"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
} from "lucide-react";
import { requestDocumentAction } from "@/actions/barangay-admin/document";
import { toast } from "sonner";

const DOC_TYPE_LABELS: Record<string, string> = {
  barangay_clearance: "Barangay Clearance",
  certificate_of_residency: "Certificate of Residency",
  certificate_of_indigency: "Certificate of Indigency",
  barangay_id: "Barangay ID",
  business_clearance: "Business Clearance",
  good_moral_certificate: "Good Moral Certificate",
};

const DOC_TYPE_DESC: Record<string, string> = {
  barangay_clearance: "For employment, loans, and general use",
  certificate_of_residency: "Proof that you reside in this barangay",
  certificate_of_indigency: "For medical, legal, and financial assistance",
  barangay_id: "Official barangay identification card",
  business_clearance: "For business permit applications",
  good_moral_certificate: "For school, employment, and legal use",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; style: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-3.5 w-3.5" />,
    style: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    style: "bg-blue-50 text-blue-700 border-blue-200",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="h-3.5 w-3.5" />,
    style: "bg-red-50 text-red-700 border-red-200",
  },
  released: {
    label: "Released",
    icon: <Send className="h-3.5 w-3.5" />,
    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

type DocRequest = {
  id: string;
  docType: string;
  purpose: string;
  status: string;
  controlNumber: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  processedAt: Date | null;
  releasedAt: Date | null;
};

export function ResidentDocumentsClient({
  requests,
}: {
  requests: DocRequest[];
}) {
  const [requestOpen, setRequestOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Request button */}
      <button
        onClick={() => setRequestOpen(true)}
        className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 active:scale-[0.98] transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-primary">
            Request a Document
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clearance, residency, indigency & more
          </p>
        </div>
      </button>

      {/* Requests list */}
      {requests.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border bg-card">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm font-medium text-muted-foreground">
            No requests yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your document requests will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            My Requests
          </p>
          {requests.map((r) => {
            const status = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;

            return (
              <div
                key={r.id}
                className="p-4 rounded-2xl border bg-card shadow-sm space-y-3"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {DOC_TYPE_LABELS[r.docType] ?? r.docType}
                    </p>
                    {r.controlNumber && (
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {r.controlNumber}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${status.style}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                {/* Purpose */}
                <p className="text-xs text-muted-foreground">{r.purpose}</p>

                {/* Rejection reason */}
                {r.status === "rejected" && r.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wide mb-0.5">
                      Reason
                    </p>
                    <p className="text-xs text-red-700">{r.rejectionReason}</p>
                  </div>
                )}

                {/* Date + action */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString("en-PH", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {r.status === "approved" && (
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                      <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <p className="text-xs text-blue-700 font-medium">
                        Ready for pickup at the Barangay Hall
                      </p>
                    </div>
                  )}

                  {r.status === "released" && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                      <Send className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <p className="text-xs text-emerald-700 font-medium">
                        Document has been released
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <DialogHeader className="mb-4">
            <DialogTitle>Request a Document</DialogTitle>
            <DialogDescription>
              Select the document you need and provide the purpose.
            </DialogDescription>
          </DialogHeader>
          <RequestForm onSuccess={() => setRequestOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Request form
// ---------------------------------------------------------------------------

function RequestForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState(
    requestDocumentAction,
    {},
  );
  const [docType, setDocType] = useState("");

  useEffect(() => {
    if (state.success) {
      toast.success("Request submitted! We'll notify you once it's ready.");
      onSuccess();
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Doc type selection — card style for mobile */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">
          Document Type <span className="text-destructive">*</span>
        </Label>
        <input type="hidden" name="docType" value={docType} />
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDocType(value)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                docType === value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-muted/30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${docType === value ? "bg-primary/15" : "bg-muted"}`}
              >
                <FileText
                  className={`h-4 w-4 ${docType === value ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {DOC_TYPE_DESC[value]}
                </p>
              </div>
            </button>
          ))}
        </div>
        {state.fieldErrors?.docType && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.docType}
          </p>
        )}
      </div>

      {/* Purpose */}
      <div className="space-y-1.5">
        <Label htmlFor="purpose" className="text-xs font-medium">
          Purpose <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="purpose"
          name="purpose"
          placeholder="e.g. For employment application, for scholarship requirements..."
          className="text-sm resize-none"
          rows={3}
        />
        {state.fieldErrors?.purpose && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.purpose}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending || !docType}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Request"
        )}
      </Button>
    </form>
  );
}
