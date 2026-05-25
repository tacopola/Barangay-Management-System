"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Pencil,
  ArrowUpRight,
} from "lucide-react";
import { updateBlotterStatusAction } from "@/actions/barangay-admin/blotter";
import { BlotterForm } from "./blotter-form";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  filed: "bg-amber-50 text-amber-700 border-amber-200",
  under_mediation: "bg-blue-50 text-blue-700 border-blue-200",
  settled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  escalated: "bg-red-50 text-red-700 border-red-200",
  dismissed: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<string, string> = {
  filed: "Filed",
  under_mediation: "Mediation",
  settled: "Settled",
  escalated: "Escalated",
  dismissed: "Dismissed",
};

type BlotterCase = {
  id: string;
  caseNumber: string;
  status: string;
  incidentDate: string;
  incidentLocation: string | null;
  narrative: string;
  isEscalated: boolean | null;
  complainantName: string | null;
  respondentName: string | null;
  complainantId: string | null;
  respondentId: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
};

type SimpleResident = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
};

type StatusFilter =
  | "all"
  | "filed"
  | "under_mediation"
  | "settled"
  | "escalated"
  | "dismissed";

export function BlotterListClient({
  cases,
  residents,
}: {
  cases: BlotterCase[];
  residents: SimpleResident[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BlotterCase | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = cases.filter((c) => {
    const matchSearch =
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.complainantName?.toLowerCase().includes(search.toLowerCase()) ||
      c.respondentName?.toLowerCase().includes(search.toLowerCase()) ||
      c.incidentLocation?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    filed: cases.filter((c) => c.status === "filed").length,
    under_mediation: cases.filter((c) => c.status === "under_mediation").length,
    settled: cases.filter((c) => c.status === "settled").length,
    escalated: cases.filter((c) => c.status === "escalated").length,
    dismissed: cases.filter((c) => c.status === "dismissed").length,
  };

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(c: BlotterCase) {
    setEditTarget(c);
    setDialogOpen(true);
  }

  function handleQuickStatus(id: string, status: "settled" | "dismissed") {
    startTransition(async () => {
      const res = await updateBlotterStatusAction(id, status);
      if (res.error) toast.error(res.error);
      else toast.success(`Case marked as ${status}.`);
      router.refresh();
    });
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Filed"
          value={counts.filed}
          accent="border-t-amber-500"
          color="text-amber-600"
        />
        <StatCard
          label="Mediation"
          value={counts.under_mediation}
          accent="border-t-blue-500"
          color="text-blue-600"
        />
        <StatCard
          label="Settled"
          value={counts.settled}
          accent="border-t-emerald-500"
          color="text-emerald-600"
        />
        <StatCard
          label="Escalated"
          value={counts.escalated}
          accent="border-t-red-500"
          color="text-red-600"
        />
        <StatCard
          label="Dismissed"
          value={counts.dismissed}
          accent="border-t-muted-foreground"
          color="text-muted-foreground"
        />
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b gap-4">
          <div>
            <h2 className="text-sm font-semibold">Blotter Cases</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {cases.length} cases
            </p>
          </div>
          <Button
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={openCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            File Case
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-3 border-b flex-wrap">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3">
                All ({cases.length})
              </TabsTrigger>
              <TabsTrigger value="filed" className="text-xs px-3">
                Filed
                {counts.filed > 0 && (
                  <span className="ml-1 bg-amber-500 text-white text-[9px] rounded-full px-1.5">
                    {counts.filed}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="under_mediation" className="text-xs px-3">
                Mediation
              </TabsTrigger>
              <TabsTrigger value="settled" className="text-xs px-3">
                Settled
              </TabsTrigger>
              <TabsTrigger value="escalated" className="text-xs px-3">
                Escalated
              </TabsTrigger>
              <TabsTrigger value="dismissed" className="text-xs px-3">
                Dismissed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative ml-auto w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search case, name, location..."
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
                  Case No.
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Parties
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">
                  Location
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
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No blotter cases found
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-mono font-medium">
                        {c.caseNumber}
                      </p>
                      {c.isEscalated && (
                        <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5 mt-0.5">
                          <AlertTriangle className="h-2.5 w-2.5" /> Escalated
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-muted-foreground">
                        {c.complainantName ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">vs.</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {c.respondentName}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-muted-foreground truncate max-w-[160px]">
                        {c.incidentLocation ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.incidentDate).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[c.status] ?? ""}`}
                      >
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-sm">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/blotter/${c.id}`}>
                              <Eye className="h-3.5 w-3.5 mr-2" /> View Case
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(c)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {c.status !== "settled" && (
                            <DropdownMenuItem
                              className="text-emerald-700 focus:text-emerald-700"
                              onClick={() => handleQuickStatus(c.id, "settled")}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-2" /> Mark
                              Settled
                            </DropdownMenuItem>
                          )}
                          {c.status !== "dismissed" && (
                            <DropdownMenuItem
                              className="text-muted-foreground"
                              onClick={() =>
                                handleQuickStatus(c.id, "dismissed")
                              }
                            >
                              <Clock className="h-3.5 w-3.5 mr-2" /> Dismiss
                            </DropdownMenuItem>
                          )}
                          {c.status !== "escalated" && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              asChild
                            >
                              <Link href={`/admin/blotter/${c.id}`}>
                                <ArrowUpRight className="h-3.5 w-3.5 mr-2" />{" "}
                                Escalate
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl mb-2 overflow-y-auto">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">
              {editTarget ? "Edit Case" : "File Blotter Case"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update the blotter case details."
                : "Record a new incident or complaint."}
            </DialogDescription>
          </DialogHeader>
          <BlotterForm
            blotterCase={editTarget}
            residents={residents}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

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
