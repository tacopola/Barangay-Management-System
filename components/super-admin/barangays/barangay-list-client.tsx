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
  Building2,
  Users,
  UserCheck,
} from "lucide-react";
import {
  toggleBarangayStatusAction,
  deleteBarangayAction,
} from "@/actions/super_admin/barangay";
import { BarangayForm } from "./barangay-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Barangay = {
  id: string;
  name: string;
  municipality: string;
  province: string;
  region: string;
  zipCode: string | null;
  contactNumber: string | null;
  email: string | null;
  isActive: boolean;
  adminCount: number;
  residentCount: number;
};

type Filter = "all" | "active" | "inactive";

export function BarangayListClient({ barangays }: { barangays: Barangay[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Barangay | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Barangay | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = barangays.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && b.isActive) ||
      (filter === "inactive" && !b.isActive);
    return matchSearch && matchFilter;
  });

  const activeCount = barangays.filter((b) => b.isActive).length;
  const inactiveCount = barangays.filter((b) => !b.isActive).length;

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(b: Barangay) {
    setEditTarget(b);
    setDialogOpen(true);
  }

  function handleToggleStatus(b: Barangay) {
    startTransition(async () => {
      const res = await toggleBarangayStatusAction(b.id, b.isActive);
      if (res.error) toast.error(res.error);
      else
        toast.success(`${b.name} ${b.isActive ? "deactivated" : "activated"}.`);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteBarangayAction(deleteTarget.id);
      if (res.error) toast.error(res.error);
      else toast.success(`${deleteTarget.name} deleted.`);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Building2 className="h-4 w-4 text-primary" />}
          label="Total"
          value={barangays.length}
          accent="border-t-primary"
        />
        <StatCard
          icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
          label="Active"
          value={activeCount}
          accent="border-t-emerald-500"
        />
        <StatCard
          icon={<Power className="h-4 w-4 text-muted-foreground" />}
          label="Inactive"
          value={inactiveCount}
          accent="border-t-muted-foreground"
        />
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b gap-4">
          <div>
            <h2 className="text-sm font-semibold">Barangay Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {barangays.length} barangays
            </p>
          </div>
          <Button
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={openCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Barangay
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between px-5 py-3 border-b gap-4 flex-wrap">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3">
                All ({barangays.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs px-3">
                Active ({activeCount})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs px-3">
                Inactive ({inactiveCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search barangay..."
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
                  Barangay
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">
                  Location
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Admins
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">
                  Residents
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
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No barangays found
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium">{b.name}</p>
                      {b.contactNumber && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {b.contactNumber}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-muted-foreground">
                        {b.municipality}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.province}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{b.adminCount}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-sm">
                        {b.residentCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={b.isActive ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {b.isActive ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => openEdit(b)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(b)}
                          >
                            <Power className="h-3.5 w-3.5 mr-2" />
                            {b.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(b)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
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

      {/* Create / Edit Dialog — centered with padding */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">
              {editTarget ? "Edit Barangay" : "Register Barangay"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editTarget
                ? "Update the barangay's information below."
                : "Fill in the details to add a new barangay."}
            </DialogDescription>
          </DialogHeader>
          <BarangayForm
            barangay={editTarget}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="p-8">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the barangay and cannot be undone. Only
              delete if there are no residents or records attached.
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
      <p className="text-3xl font-light">{value}</p>
    </div>
  );
}
