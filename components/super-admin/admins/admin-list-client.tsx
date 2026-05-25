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
  KeyRound,
  Users,
  UserCheck,
  UserX,
  Building2,
} from "lucide-react";

import {
  toggleAdminStatusAction,
  deleteAdminAction,
} from "@/actions/super_admin/admin";

import { AdminForm } from "./barangay-admin-form";
import { DepartmentAdminForm } from "./department-admin-form";
import { ResetPasswordForm } from "./reset-password-form";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

type BarangayAdmin = {
  id: string;
  authId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  email: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  barangayId: string | null;
  barangayName: string | null;
  createdAt: Date;
};

type DepartmentAdmin = {
  id: string;
  authId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  email: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  departmentId: string | null;
  departmentName: string | null;
  departmentType: string | null;
  createdAt: Date;
};

type Barangay = {
  id: string;
  name: string;
};

type Department = {
  id: string;
  name: string;
  type: string;
};

type Filter = "all" | "active" | "inactive";

export function AdminListClient({
  barangayAdmins,
  departmentAdmins,
  barangays,
  departments,
}: {
  barangayAdmins: BarangayAdmin[];
  departmentAdmins: DepartmentAdmin[];
  barangays: Barangay[];
  departments: Department[];
}) {
  const router = useRouter();

  const [adminType, setAdminType] = useState<
    "barangay_admin" | "department_admin"
  >("barangay_admin");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const [editTarget, setEditTarget] = useState<
    BarangayAdmin | DepartmentAdmin | null
  >(null);

  const [resetTarget, setResetTarget] = useState<
    BarangayAdmin | DepartmentAdmin | null
  >(null);

  const [deleteTarget, setDeleteTarget] = useState<
    BarangayAdmin | DepartmentAdmin | null
  >(null);

  const [isPending, startTransition] = useTransition();

  const admins =
    adminType === "barangay_admin"
      ? barangayAdmins
      : departmentAdmins;

  const filtered = admins.filter((a) => {
    const fullName =
      `${a.firstName} ${a.lastName}`.toLowerCase();

    const relation =
      adminType === "barangay_admin"
        ? (a as BarangayAdmin).barangayName
        : (a as DepartmentAdmin).departmentName;

    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      relation?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "active" && a.isActive) ||
      (filter === "inactive" && !a.isActive);

    return matchSearch && matchFilter;
  });

  const activeCount = admins.filter((a) => a.isActive).length;
  const inactiveCount = admins.filter((a) => !a.isActive).length;

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(a: BarangayAdmin | DepartmentAdmin) {
    setEditTarget(a);
    setFormOpen(true);
  }

  function openReset(a: BarangayAdmin | DepartmentAdmin) {
    setResetTarget(a);
    setResetOpen(true);
  }

  function handleToggleStatus(
    a: BarangayAdmin | DepartmentAdmin,
  ) {
    startTransition(async () => {
      const res = await toggleAdminStatusAction(
        a.id,
        a.isActive,
      );

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          `${a.firstName} ${a.lastName} ${
            a.isActive ? "deactivated" : "activated"
          }.`,
        );
      }

      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const res = await deleteAdminAction(
        deleteTarget.id,
        deleteTarget.authId,
      );

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          `${deleteTarget.firstName} ${deleteTarget.lastName} deleted.`,
        );
      }

      setDeleteTarget(null);

      router.refresh();
    });
  }

  const fullName = (
    a: BarangayAdmin | DepartmentAdmin,
  ) =>
    `${a.firstName}${
      a.middleName ? ` ${a.middleName[0]}.` : ""
    } ${a.lastName}${a.suffix ? ` ${a.suffix}` : ""}`;

  const initials = (
    a: BarangayAdmin | DepartmentAdmin,
  ) =>
    `${a.firstName[0]}${a.lastName[0]}`.toUpperCase();

  return (
    <>
      {/* Admin Type Tabs */}
      <Tabs
        value={adminType}
        onValueChange={(v) =>
          setAdminType(
            v as "barangay_admin" | "department_admin",
          )
        }
      >
        <TabsList className="h-10">
          <TabsTrigger
            value="barangay_admin"
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Barangay Admins
          </TabsTrigger>

          <TabsTrigger
            value="department_admin"
            className="gap-2"
          >
            <Building2 className="h-4 w-4" />
            Department Admins
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <StatCard
          icon={<Users className="h-4 w-4 text-primary" />}
          label="Total"
          value={admins.length}
          accent="border-t-primary"
        />

        <StatCard
          icon={
            <UserCheck className="h-4 w-4 text-emerald-600" />
          }
          label="Active"
          value={activeCount}
          accent="border-t-emerald-500"
        />

        <StatCard
          icon={
            <UserX className="h-4 w-4 text-muted-foreground" />
          }
          label="Inactive"
          value={inactiveCount}
          accent="border-t-muted-foreground"
        />
      </div>

      {/* Main Card */}
      <div className="rounded-xl border bg-card overflow-hidden mt-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-sm font-semibold">
              {adminType === "barangay_admin"
                ? "Barangay Admin Accounts"
                : "Department Admin Accounts"}
            </h2>

            <p className="text-xs text-muted-foreground mt-1">
              {filtered.length} of {admins.length} admins
            </p>
          </div>

          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={openCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Admin
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between px-5 py-3 border-b gap-4 flex-wrap">
          <Tabs
            value={filter}
            onValueChange={(v) =>
              setFilter(v as Filter)
            }
          >
            <TabsList className="h-8">
              <TabsTrigger value="all">
                All ({admins.length})
              </TabsTrigger>

              <TabsTrigger value="active">
                Active ({activeCount})
              </TabsTrigger>

              <TabsTrigger value="inactive">
                Inactive ({inactiveCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search admin..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Admin
                </th>

                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  {adminType === "barangay_admin"
                    ? "Barangay"
                    : "Department"}
                </th>

                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                  Contact
                </th>

                <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Status
                </th>

                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-16 text-sm text-muted-foreground"
                  >
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No admins found
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary">
                          {initials(a)}
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            {fullName(a)}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {a.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-muted-foreground">
                        {adminType === "barangay_admin"
                          ? (
                              a as BarangayAdmin
                            ).barangayName ?? "—"
                          : (
                              a as DepartmentAdmin
                            ).departmentName ?? "—"}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="text-sm text-muted-foreground">
                        {a.phoneNumber ?? "—"}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          a.isActive
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {a.isActive
                          ? "Active"
                          : "Inactive"}
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

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              openEdit(a)
                            }
                          >
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              openReset(a)
                            }
                          >
                            <KeyRound className="h-3.5 w-3.5 mr-2" />
                            Reset Password
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleStatus(a)
                            }
                          >
                            <Power className="h-3.5 w-3.5 mr-2" />

                            {a.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              setDeleteTarget(a)
                            }
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

      {/* Create/Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={setFormOpen}
      >
        <DialogContent className="sm:max-w-lg p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">
              {editTarget
                ? "Edit Admin"
                : "Create Admin Account"}
            </DialogTitle>

            <DialogDescription>
              {adminType === "barangay_admin"
                ? "Manage barangay admin accounts."
                : "Manage department admin accounts."}
            </DialogDescription>
          </DialogHeader>

          {adminType === "barangay_admin" ? (
            <AdminForm
              admin={editTarget as any}
              barangays={barangays}
              onSuccess={() => {
                setFormOpen(false);
                router.refresh();
              }}
            />
          ) : (
            <DepartmentAdminForm
              admin={editTarget as any}
              departments={departments}
              onSuccess={() => {
                setFormOpen(false);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password */}
      <Dialog
        open={resetOpen}
        onOpenChange={setResetOpen}
      >
        <DialogContent className="sm:max-w-sm p-8">
          <DialogHeader className="mb-2">
            <DialogTitle>
              Reset Password
            </DialogTitle>

            <DialogDescription>
              Set a new password for{" "}
              {resetTarget
                ? `${resetTarget.firstName} ${resetTarget.lastName}`
                : "this admin"}
              .
            </DialogDescription>
          </DialogHeader>

          {resetTarget && (
            <ResetPasswordForm
              authId={resetTarget.authId}
              onSuccess={() => {
                setResetOpen(false);
                toast.success(
                  "Password reset successfully.",
                );
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) =>
          !o && setDeleteTarget(null)
        }
      >
        <AlertDialogContent className="p-8">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {deleteTarget
                ? `${deleteTarget.firstName} ${deleteTarget.lastName}`
                : "this admin"}
              ?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This permanently deletes the admin
              account and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

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
    <div
      className={`rounded-xl border bg-card p-4 border-t-2 ${accent}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>

        {icon}
      </div>

      <p className="text-3xl font-light">
        {value}
      </p>
    </div>
  );
}