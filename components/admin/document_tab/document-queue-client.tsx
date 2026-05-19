"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Printer,
  Send,
  FileText,
} from "lucide-react";
import {
  approveDocumentAction,
  rejectDocumentAction,
  releaseDocumentAction,
  adminRequestDocumentAction,
} from "@/actions/admin/document";
import { toast } from "sonner";

const DOC_TYPE_LABELS: Record<string, string> = {
  barangay_clearance: "Barangay Clearance",
  certificate_of_residency: "Cert. of Residency",
  certificate_of_indigency: "Cert. of Indigency",
  barangay_id: "Barangay ID",
  business_clearance: "Business Clearance",
  good_moral_certificate: "Good Moral Cert.",
};

const DOC_TYPES = Object.entries(DOC_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-blue-50 text-blue-700 border-blue-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  released: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

type DocRequest = {
  id: string;
  docType: string;
  purpose: string;
  status: string;
  controlNumber: string | null;
  rejectionReason: string | null;
  orNumber: string | null;
  processedAt: Date | null;
  releasedAt: Date | null;
  createdAt: Date;
  residentId: string;
  requestedById: string;
  residentFirstName: string | null;
  residentLastName: string | null;
  residentMiddleName: string | null;
  residentContact: string | null;
};

type SimpleResident = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
};

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "released";

export function DocumentQueueClient({
  requests,
  residents,
}: {
  requests: DocRequest[];
  residents: SimpleResident[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DocRequest | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [orNumber, setOrNumber] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = requests.filter((r) => {
    const name = `${r.residentFirstName} ${r.residentLastName}`.toLowerCase();
    const matchSearch =
      name.includes(search.toLowerCase()) ||
      r.controlNumber?.toLowerCase().includes(search.toLowerCase()) ||
      DOC_TYPE_LABELS[r.docType]?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchType = typeFilter === "all" || r.docType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    released: requests.filter((r) => r.status === "released").length,
  };

  function residentName(r: DocRequest) {
    return `${r.residentFirstName ?? ""} ${r.residentMiddleName ? r.residentMiddleName[0] + ". " : ""}${r.residentLastName ?? ""}`.trim();
  }

  function handleApprove(id: string) {
    startTransition(async () => {
      const res = await approveDocumentAction(id);
      if (res.error) toast.error(res.error);
      else toast.success("Request approved.");
      router.refresh();
    });
  }

  function handleReject() {
    if (!selectedRequest) return;
    startTransition(async () => {
      const res = await rejectDocumentAction(selectedRequest.id, rejectReason);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Request rejected.");
        setRejectOpen(false);
        setRejectReason("");
      }
      router.refresh();
    });
  }

  function handleRelease() {
    if (!selectedRequest) return;
    startTransition(async () => {
      const res = await releaseDocumentAction(selectedRequest.id, orNumber);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Document released.");
        setReleaseOpen(false);
        setOrNumber("");
      }
      router.refresh();
    });
  }

function handlePrint(id: string) {
  window.open(`/api/documents/${id}/print`, "_blank")
}

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Pending"
          value={counts.pending}
          accent="border-t-amber-500"
          color="text-amber-600"
        />
        <StatCard
          label="Approved"
          value={counts.approved}
          accent="border-t-blue-500"
          color="text-blue-600"
        />
        <StatCard
          label="Released"
          value={counts.released}
          accent="border-t-emerald-500"
          color="text-emerald-600"
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          accent="border-t-red-500"
          color="text-red-600"
        />
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b gap-4">
          <div>
            <h2 className="text-sm font-semibold">Document Queue</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {requests.length} requests
            </p>
          </div>
          <Button
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            New Request
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-3 border-b flex-wrap">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <TabsList className="h-8">
              <TabsTrigger value="pending" className="text-xs px-3">
                Pending{" "}
                {counts.pending > 0 && (
                  <span className="ml-1 bg-amber-500 text-white text-[9px] rounded-full px-1.5">
                    {counts.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs px-3">
                Approved
              </TabsTrigger>
              <TabsTrigger value="released" className="text-xs px-3">
                Released
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs px-3">
                Rejected
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-3">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 text-xs w-44">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Types
              </SelectItem>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs">
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative ml-auto w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name or control no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Resident
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Document
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">
                  Purpose
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">
                  Date
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Status
                </th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-sm text-muted-foreground"
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No requests found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium">{residentName(r)}</p>
                      {r.controlNumber && (
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {r.controlNumber}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm">
                        {DOC_TYPE_LABELS[r.docType] ?? r.docType}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-muted-foreground truncate max-w-45">
                        {r.purpose}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[r.status] ?? ""}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        {/* Pending actions */}
                        {r.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => handleApprove(r.id)}
                              disabled={isPending}
                            >
                              <CheckCircle className="h-3 w-3" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 text-red-700 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                setSelectedRequest(r);
                                setRejectOpen(true);
                              }}
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                          </>
                        )}

                        {/* Approved — admin prints and releases */}
                        {r.status === "approved" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => handlePrint(r.id)}
                            >
                              <Printer className="h-3 w-3" /> Print
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => {
                                setSelectedRequest(r);
                                setReleaseOpen(true);
                              }}
                            >
                              <Send className="h-3 w-3" /> Release
                            </Button>
                          </>
                        )}

                        {/* Released — admin can reprint if needed */}
                        {r.status === "released" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 text-muted-foreground"
                            onClick={() => handlePrint(r.id)}
                          >
                            <Printer className="h-3 w-3" /> Reprint
                          </Button>
                        )}

                        {/* Rejected — show reason on hover */}
                        {r.status === "rejected" && r.rejectionReason && (
                          <span
                            className="text-[10px] text-muted-foreground italic truncate max-w-30"
                            title={r.rejectionReason}
                          >
                            {r.rejectionReason}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create request dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <DialogHeader className="mb-4">
            <DialogTitle>New Document Request</DialogTitle>
            <DialogDescription>
              Create a walk-in request on behalf of a resident.
            </DialogDescription>
          </DialogHeader>
          <WalkInRequestForm
            residents={residents}
            onSuccess={() => {
              setCreateOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-sm p-8">
          <DialogHeader className="mb-4">
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request. The resident will be
              notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Rejection Reason</Label>
              <Textarea
                placeholder="e.g. Incomplete requirements, invalid information..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || !rejectReason}
            >
              Reject Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Release dialog */}
      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent className="sm:max-w-sm p-8">
          <DialogHeader className="mb-4">
            <DialogTitle>Release Document</DialogTitle>
            <DialogDescription>
              Mark this document as released. Optionally enter the official
              receipt number.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                OR Number (optional)
              </Label>
              <Input
                placeholder="e.g. OR-2025-001"
                value={orNumber}
                onChange={(e) => setOrNumber(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleRelease}
              disabled={isPending}
            >
              <Send className="h-4 w-4 mr-2" /> Confirm Release
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Walk-in request form
// ---------------------------------------------------------------------------

function WalkInRequestForm({
  residents,
  onSuccess,
}: {
  residents: SimpleResident[];
  onSuccess: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    adminRequestDocumentAction,
    {},
  );
  const [residentId, setResidentId] = useState("");
  const [docType, setDocType] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success("Request created.");
      onSuccess();
      router.refresh();
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Resident <span className="text-destructive">*</span>
        </Label>
        <Select
          name="residentId"
          value={residentId}
          onValueChange={setResidentId}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select resident..." />
          </SelectTrigger>
          <SelectContent>
            {residents.map((r) => (
              <SelectItem key={r.id} value={r.id} className="text-sm">
                {r.lastName}, {r.firstName}{" "}
                {r.middleName ? r.middleName[0] + "." : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Document Type <span className="text-destructive">*</span>
        </Label>
        <Select name="docType" value={docType} onValueChange={setDocType}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select document..." />
          </SelectTrigger>
          <SelectContent>
            {DOC_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-sm">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Purpose <span className="text-destructive">*</span>
        </Label>
        <Textarea
          name="purpose"
          placeholder="e.g. Employment requirement, scholarship application..."
          className="text-sm resize-none"
          rows={2}
        />
        {state.fieldErrors?.purpose && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.purpose}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Request"}
      </Button>
    </form>
  );
}

// Add missing imports at top
import { useActionState, useEffect } from "react";

function StatCard({
  label,
  value,
  accent,
  color,
}: {
  label: string;
  value: number;
  accent: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border bg-card p-4 border-t-2 ${accent}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={`text-3xl font-light ${color}`}>{value}</p>
    </div>
  );
}
