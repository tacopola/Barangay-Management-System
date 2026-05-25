"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  Trash2,
  Power,
  BriefcaseBusiness,
  UserCheck,
  Users,
} from "lucide-react";

import {
  toggleDepartmentStatusAction,
  deleteDepartmentAction,
} from "@/actions/super_admin/department";

import { DepartmentForm } from "./department-form";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Department = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  contactNumber: string | null;
  email: string | null;
  isActive: boolean;
  adminCount: number;
};

type Filter = "all" | "active" | "inactive";

export function DepartmentListClient({
  departments,
}: {
  departments: Department[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [isPending, startTransition] = useTransition();
  const filtered = departments.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ||
      (filter === "active" && d.isActive) ||
      (filter === "inactive" && !d.isActive);

    return matchSearch && matchFilter;
  });

  const activeCount = departments.filter((d) => d.isActive).length;
  const inactiveCount = departments.filter((d) => !d.isActive).length;

  const departmentTypeLabels: Record<string, string> = {
    treasury: "Treasury",
    health: "Health",
    agriculture: "Agriculture",
    engineering: "Engineering",
    social_welfare: "Social Welfare",
    civil_registry: "Civil Registry",
    budget: "Budget Office",
    accounting: "Accounting",
    assessor: "Assessor's Office",
    hr: "Human Resources",
    planning: "Planning & Development",
    mayor_office: "Mayor's Office",
    vice_mayor_office: "Vice Mayor's Office",
    sb_office: "Sangguniang Bayan Office",
  };

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(department: Department) {
    setEditTarget(department);
    setDialogOpen(true);
  }

  function handleToggleStatus(department: Department) {
    startTransition(async () => {
      const res = await toggleDepartmentStatusAction(
        department.id,
        department.isActive,
      );

      if (res.error) toast.error(res.error);
      else {
        toast.success(
          `${department.name} ${
            department.isActive ? "deactivated" : "activated"
          }.`,
        );
      }

      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const res = await deleteDepartmentAction(deleteTarget.id);

      if (res.error) toast.error(res.error);
      else {
        toast.success(`${deleteTarget.name} deleted.`);
      }

      setDeleteTarget(null);

      router.refresh();
    });
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<BriefcaseBusiness className="h-4 w-4 text-primary" />}
          label="Total"
          value={departments.length}
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

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-sm font-semibold">Department Directory</h2>

            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {departments.length} departments
            </p>
          </div>

          <Button
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={openCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Department
          </Button>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b gap-4 flex-wrap">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3">
                All ({departments.length})
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
              placeholder="Search department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Department
                </th>

                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Type
                </th>

                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Admins
                </th>

                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Status
                </th>

                <th className="px-5 py-2.5" />
              </tr>
            </thead>

            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b hover:bg-muted/20">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium">{d.name}</p>

                    {d.email && (
                      <p className="text-xs text-muted-foreground">{d.email}</p>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge variant="secondary" className="font-normal">
                      {departmentTypeLabels[d.type] ?? d.type}
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />

                      <span className="text-sm">{d.adminCount}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge variant={d.isActive ? "default" : "secondary"}>
                      {d.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(d)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleToggleStatus(d)}>
                          <Power className="h-3.5 w-3.5 mr-2" />
                          {d.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteTarget(d)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Department" : "Create Department"}
            </DialogTitle>

            <DialogDescription>
              Manage municipal department details.
            </DialogDescription>
          </DialogHeader>

          <DepartmentForm
            department={editTarget}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
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
