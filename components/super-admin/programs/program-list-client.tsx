"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
  Boxes,
  Users,
} from "lucide-react";
import {
  toggleProgramStatusAction,
  deleteProgramAction,
} from "@/actions/super_admin/program";
import { ProgramForm } from "./program-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const PROGRAM_TYPE_LABELS: Record<string, string> = {
  "4ps": "4Ps (Pantawid Pamilya)",
  senior_citizen: "Senior Citizen",
  pwd: "PWD",
  solo_parent: "Solo Parent",
  indigent: "Indigent",
};

export const PROGRAM_TYPE_COLORS: Record<string, string> = {
  "4ps": "bg-blue-500/10 text-blue-700 border-blue-200",
  senior_citizen: "bg-amber-500/10 text-amber-700 border-amber-200",
  pwd: "bg-purple-500/10 text-purple-700 border-purple-200",
  solo_parent: "bg-pink-500/10 text-pink-700 border-pink-200",
  indigent: "bg-orange-500/10 text-orange-700 border-orange-200",
};

type Program = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  isActive: boolean;
  barangayId: string | null;
  barangayName: string | null;
  beneficiaryCount: number;
  createdAt: Date;
};

type Barangay = { id: string; name: string };
type Filter = "all" | "active" | "inactive";

export function ProgramListClient({
  programs,
  barangays,
}: {
  programs: Program[];
  barangays: Barangay[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Program | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = programs.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barangayName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && p.isActive) ||
      (filter === "inactive" && !p.isActive);
    const matchType = typeFilter === "all" || p.type === typeFilter;
    return matchSearch && matchFilter && matchType;
  });

  const activeCount = programs.filter((p) => p.isActive).length;
  const inactiveCount = programs.filter((p) => !p.isActive).length;
  const totalBeneficiaries = programs.reduce(
    (s, p) => s + p.beneficiaryCount,
    0,
  );

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(p: Program) {
    setEditTarget(p);
    setDialogOpen(true);
  }

  function handleToggle(p: Program) {
    startTransition(async () => {
      const res = await toggleProgramStatusAction(p.id, p.isActive);
      if (res.error) toast.error(res.error);
      else
        toast.success(`${p.name} ${p.isActive ? "deactivated" : "activated"}.`);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteProgramAction(deleteTarget.id);
      if (res.error) toast.error(res.error);
      else toast.success(`${deleteTarget.name} deleted.`);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Boxes className="h-4 w-4 text-primary" />}
          label="Total Programs"
          value={programs.length}
          accent="border-t-primary"
        />
        <StatCard
          icon={<Users className="h-4 w-4 text-emerald-600" />}
          label="Beneficiaries"
          value={totalBeneficiaries}
          accent="border-t-emerald-500"
        />
        <StatCard
          icon={<Power className="h-4 w-4 text-muted-foreground" />}
          label="Active"
          value={activeCount}
          accent="border-t-amber-500"
        />
        <StatCard
          icon={<Power className="h-4 w-4 text-muted-foreground" />}
          label="Inactive"
          value={inactiveCount}
          accent="border-t-red-500"
        />
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b gap-4">
          <div>
            <h2 className="text-sm font-semibold">Program Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {programs.length} programs
            </p>
          </div>
          <Button
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={openCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Program
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between px-5 py-3 border-b gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs px-3">
                  All
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs px-3">
                  Active
                </TabsTrigger>
                <TabsTrigger value="inactive" className="text-xs px-3">
                  Inactive
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={typeFilter} onValueChange={setTypeFilter}>
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs px-3">
                  All Types
                </TabsTrigger>
                <TabsTrigger value="4ps" className="text-xs px-3">
                  4Ps
                </TabsTrigger>
                <TabsTrigger value="senior_citizen" className="text-xs px-3">
                  Senior
                </TabsTrigger>
                <TabsTrigger value="pwd" className="text-xs px-3">
                  PWD
                </TabsTrigger>
                <TabsTrigger value="solo_parent" className="text-xs px-3">
                  Solo Parent
                </TabsTrigger>
                <TabsTrigger value="indigent" className="text-xs px-3">
                  Indigent
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search program..."
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
                  Program
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Type
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">
                  Barangay
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">
                  Beneficiaries
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
                    <Boxes className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No programs found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-50">
                          {p.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${PROGRAM_TYPE_COLORS[p.type] ?? ""}`}
                      >
                        {PROGRAM_TYPE_LABELS[p.type] ?? p.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-muted-foreground">
                        {p.barangayName ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{p.beneficiaryCount}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={p.isActive ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggle(p)}>
                            <Power className="h-3.5 w-3.5 mr-2" />
                            {p.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(p)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">
              {editTarget ? "Edit Program" : "Add Program"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update program details."
                : "Create a new beneficiary program for a barangay."}
            </DialogDescription>
          </DialogHeader>
          <ProgramForm
            program={editTarget}
            barangays={barangays}
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
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the program. Beneficiary records linked
              to it will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
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
  value: number;
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
      <p className="text-3xl font-light">{value.toLocaleString()}</p>
    </div>
  );
}
