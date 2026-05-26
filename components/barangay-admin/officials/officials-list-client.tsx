"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  UserCheck,
  LayoutList,
  Network,
  ToggleLeft,
} from "lucide-react";
import {
  deleteOfficialAction,
  toggleOfficialActiveAction,
} from "@/actions/barangay-admin/official";
import { OfficialForm, POSITION_LABELS } from "./officials-form";
import { toast } from "sonner";

type Official = {
  id: string;
  residentId: string | null;
  position: string;
  termStart: string;
  termEnd: string | null;
  isActive: boolean;
  residentName: string | null;
};

type SimpleResident = {
  id: string;
  firstName: string;
  lastName: string;
};

const POSITION_ORDER = [
  "punong_barangay",
  "barangay_secretary",
  "barangay_treasurer",
  "kagawad",
  "sk_chairperson",
  "sk_kagawad",
  "tanod",
];

const POSITION_COLORS: Record<
  string,
  { bg: string; text: string; border: string; accent: string }
> = {
  punong_barangay: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    accent: "border-t-amber-500",
  },
  barangay_secretary: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    accent: "border-t-blue-500",
  },
  barangay_treasurer: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    accent: "border-t-emerald-500",
  },
  kagawad: {
    bg: "bg-violet-50",
    text: "text-violet-800",
    border: "border-violet-200",
    accent: "border-t-violet-500",
  },
  sk_chairperson: {
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
    accent: "border-t-sky-500",
  },
  sk_kagawad: {
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    accent: "border-t-indigo-500",
  },
  tanod: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    accent: "border-t-slate-400",
  },
};

function getInitials(name: string | null, fallback = "?") {
  if (!name) return fallback;
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// OrgChart view
// ---------------------------------------------------------------------------

function OrgChart({
  officials,
  onEdit,
  onDelete,
  onToggle,
}: {
  officials: Official[];
  onEdit: (o: Official) => void;
  onDelete: (o: Official) => void;
  onToggle: (o: Official) => void;
}) {
  const active = officials.filter((o) => o.isActive);

  const punong = active.find((o) => o.position === "punong_barangay");
  const secretary = active.find((o) => o.position === "barangay_secretary");
  const treasurer = active.find((o) => o.position === "barangay_treasurer");
  const kagawads = active.filter((o) => o.position === "kagawad");
  const skChair = active.find((o) => o.position === "sk_chairperson");
  const skKagawads = active.filter((o) => o.position === "sk_kagawad");
  const tanods = active.filter((o) => o.position === "tanod");

  return (
    <div className="p-6 overflow-x-auto">
      <div className="min-w-160 space-y-6">
        {/* Punong Barangay — top center */}
        {punong && (
          <div className="flex justify-center">
            <OrgCard
              official={punong}
              size="lg"
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          </div>
        )}

        {/* Connector line */}
        {punong && (secretary || treasurer || kagawads.length > 0) && (
          <div className="flex justify-center">
            <div className="w-px h-6 bg-border" />
          </div>
        )}

        {/* Secretary & Treasurer row */}
        {(secretary || treasurer) && (
          <>
            <div className="flex justify-center gap-6">
              {secretary && (
                <OrgCard
                  official={secretary}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              )}
              {treasurer && (
                <OrgCard
                  official={treasurer}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              )}
            </div>
            {kagawads.length > 0 && (
              <div className="flex justify-center">
                <div className="w-px h-6 bg-border" />
              </div>
            )}
          </>
        )}

        {/* Kagawads row */}
        {kagawads.length > 0 && (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold text-center mb-3">
                Kagawad
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {kagawads.map((o) => (
                  <OrgCard
                    key={o.id}
                    official={o}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* SK row */}
        {(skChair || skKagawads.length > 0) && (
          <div className="rounded-xl border border-dashed border-sky-300 bg-sky-50/40 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-sky-600 font-bold">
              Sangguniang Kabataan
            </p>
            <div className="flex flex-wrap gap-3">
              {skChair && (
                <OrgCard
                  official={skChair}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              )}
              {skKagawads.map((o) => (
                <OrgCard
                  key={o.id}
                  official={o}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tanod row */}
        {tanods.length > 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/40 p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              Barangay Tanod
            </p>
            <div className="flex flex-wrap gap-3">
              {tanods.map((o) => (
                <OrgCard
                  key={o.id}
                  official={o}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        )}

        {active.length === 0 && (
          <div className="text-center py-16 text-sm text-muted-foreground">
            <Network className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No active officials. Add officials to build the org chart.
          </div>
        )}
      </div>
    </div>
  );
}

function OrgCard({
  official,
  size = "sm",
  onEdit,
  onDelete,
  onToggle,
}: {
  official: Official;
  size?: "sm" | "lg";
  onEdit: (o: Official) => void;
  onDelete: (o: Official) => void;
  onToggle: (o: Official) => void;
}) {
  const colors = POSITION_COLORS[official.position] ?? POSITION_COLORS.tanod;
  const initials = getInitials(official.residentName);
  const label = POSITION_LABELS[official.position] ?? official.position;

  return (
    <div
      className={`rounded-xl border-t-2 border bg-card shadow-sm ${colors.accent} ${size === "lg" ? "w-52" : "w-44"}`}
    >
      <div className="p-4 space-y-3">
        {/* Avatar + actions */}
        <div className="flex items-start justify-between">
          <div
            className={`rounded-full flex items-center justify-center font-bold shrink-0 ${colors.bg} ${colors.text} ${size === "lg" ? "w-12 h-12 text-base" : "w-9 h-9 text-xs"}`}
          >
            {initials}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-sm">
              <DropdownMenuItem onClick={() => onEdit(official)}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggle(official)}>
                <ToggleLeft className="h-3.5 w-3.5 mr-2" />
                {official.isActive ? "Set Inactive" : "Set Active"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(official)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Name & position */}
        <div>
          <p
            className={`font-semibold leading-tight ${size === "lg" ? "text-sm" : "text-xs"}`}
          >
            {official.residentName ?? "Vacant"}
          </p>
          <p
            className={`text-muted-foreground mt-0.5 ${size === "lg" ? "text-xs" : "text-[10px]"}`}
          >
            {label}
          </p>
        </div>

        {/* Term */}
        <p className="text-[9px] text-muted-foreground border-t pt-2">
          Since {formatDate(official.termStart)}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

function ListView({
  officials,
  onEdit,
  onDelete,
  onToggle,
}: {
  officials: Official[];
  onEdit: (o: Official) => void;
  onDelete: (o: Official) => void;
  onToggle: (o: Official) => void;
}) {
  const sorted = [...officials].sort(
    (a, b) =>
      POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position),
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
        No officials found.
      </div>
    );
  }

  return (
    <div className="divide-y">
      {sorted.map((o) => {
        const colors = POSITION_COLORS[o.position] ?? POSITION_COLORS.tanod;
        const label = POSITION_LABELS[o.position] ?? o.position;
        const initials = getInitials(o.residentName);

        return (
          <div
            key={o.id}
            className="flex items-center gap-3 px-5 py-4 hover:bg-muted/20 transition-colors"
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colors.bg} ${colors.text}`}
            >
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold">
                  {o.residentName ?? "Vacant"}
                </p>
                {!o.isActive && (
                  <span className="text-[9px] text-muted-foreground bg-muted border px-1.5 py-0.5 rounded-full font-medium">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {label} · Since {formatDate(o.termStart)}
                {o.termEnd ? ` – ${formatDate(o.termEnd)}` : ""}
              </p>
            </div>

            {/* Position badge */}
            <Badge
              variant="outline"
              className={`text-[10px] shrink-0 hidden sm:flex ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {label}
            </Badge>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-sm">
                <DropdownMenuItem onClick={() => onEdit(o)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggle(o)}>
                  <ToggleLeft className="h-3.5 w-3.5 mr-2" />
                  {o.isActive ? "Set Inactive" : "Set Active"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(o)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export function OfficialListClient({
  officials,
  allResidents,
}: {
  officials: Official[];
  allResidents: SimpleResident[];
}) {
  const router = useRouter();
  const [view, setView] = useState<"org" | "list">("org");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Official | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Official | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeCount = officials.filter((o) => o.isActive).length;

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(o: Official) {
    setEditTarget(o);
    setDialogOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteOfficialAction(deleteTarget.id);
      if (res.error) toast.error(res.error);
      else toast.success("Official removed.");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function handleToggle(o: Official) {
    startTransition(async () => {
      const res = await toggleOfficialActiveAction(o.id, o.isActive);
      if (res.error) toast.error(res.error);
      else
        toast.success(
          `${o.residentName ?? "Official"} marked as ${o.isActive ? "inactive" : "active"}.`,
        );
      router.refresh();
    });
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
          label="Total Officials"
          value={String(officials.length)}
          accent="border-t-primary"
        />
        <StatCard
          icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
          label="Active Officials"
          value={String(activeCount)}
          accent="border-t-emerald-500"
        />
        <StatCard
          icon={<Users className="h-4 w-4 text-blue-600" />}
          label="Positions Filled"
          value={String(
            new Set(officials.filter((o) => o.isActive).map((o) => o.position))
              .size,
          )}
          accent="border-t-blue-500"
        />
      </div>

      {/* Main card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b gap-4">
          <div>
            <h2 className="text-sm font-semibold">Officials Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {officials.length} official{officials.length !== 1 ? "s" : ""}{" "}
              registered
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center rounded-lg border overflow-hidden">
              <button
                onClick={() => setView("org")}
                className={`px-2.5 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${view === "org" ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
              >
                <Network className="h-3.5 w-3.5" />
                Org Chart
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-2.5 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                List
              </button>
            </div>
            <Button
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={openCreate}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Official
            </Button>
          </div>
        </div>

        {/* Content */}
        {view === "org" ? (
          <OrgChart
            officials={officials}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onToggle={handleToggle}
          />
        ) : (
          <ListView
            officials={officials}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onToggle={handleToggle}
          />
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">
              {editTarget ? "Edit Official" : "Add Official"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update this official's details."
                : "Add a new barangay official and assign their position."}
            </DialogDescription>
          </DialogHeader>
          <OfficialForm
            official={editTarget}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="p-8">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove{" "}
              {deleteTarget?.residentName ??
                POSITION_LABELS[deleteTarget?.position ?? ""] ??
                "this official"}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this official record. The resident
              themselves will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl border bg-card p-4 border-t-2 ${accent}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        {icon}
      </div>
      <p className="text-3xl font-light">{value}</p>
    </div>
  );
}
