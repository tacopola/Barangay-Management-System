"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Home,
  Users,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Crown,
} from "lucide-react";
import { deleteHouseholdAction } from "@/actions/admin/household";
import { HouseholdForm } from "./household-form";
import { toast } from "sonner";


type Member = {
  id: string;
  firstName: string;
  lastName: string;
  sex: string;
  birthDate: string;
  isVerified: boolean | null;
};

type Household = {
  id: string;
  houseNumber: string | null;
  streetPurok: string | null;
  headResidentId: string | null;
  headName: string | null;
  members: Member[];
  memberCount: number;
  createdAt: Date;
};


function householdLabel(h: Household) {
  if (h.headName) {
    const lastName = h.headName.split(" ").pop();
    return `${lastName} Household`;
  }
  return `${h.houseNumber ? "#" + h.houseNumber + " " : ""}${h.streetPurok ?? "Household"}`;
}

function householdAddress(h: Household) {
  return [h.houseNumber ? "#" + h.houseNumber : null, h.streetPurok]
    .filter(Boolean)
    .join(" · ");
}

function getAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// Derive a SimpleResident for the current head from the household's member list
// so we can pre-populate the search input when editing
function getHeadResident(h: Household) {
  if (!h.headResidentId || !h.headName) return null;
  const member = h.members.find((m) => m.id === h.headResidentId);
  if (!member) return null;
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
  };
}

export function HouseholdListClient({
  households,
}: {
  households: Household[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Household | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Household | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = households.filter((h) => {
    const label = householdLabel(h).toLowerCase();
    return (
      label.includes(search.toLowerCase()) ||
      h.streetPurok?.toLowerCase().includes(search.toLowerCase()) ||
      h.headName?.toLowerCase().includes(search.toLowerCase())
    );
  });

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(h: Household) {
    setEditTarget(h);
    setDialogOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteHouseholdAction(deleteTarget.id);
      if (res.error) toast.error(res.error);
      else toast.success(`${householdLabel(deleteTarget)} deleted.`);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const totalMembers = households.reduce((s, h) => s + h.memberCount, 0);
  const avgSize =
    households.length > 0 ? (totalMembers / households.length).toFixed(1) : "0";

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Home className="h-4 w-4 text-primary" />}
          label="Total Households"
          value={String(households.length)}
          accent="border-t-primary"
        />
        <StatCard
          icon={<Users className="h-4 w-4 text-blue-600" />}
          label="Total Members"
          value={String(totalMembers)}
          accent="border-t-blue-500"
        />
        <StatCard
          icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
          label="Avg. Household Size"
          value={avgSize}
          accent="border-t-emerald-500"
        />
      </div>

      {/* Main card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b gap-4">
          <div>
            <h2 className="text-sm font-semibold">Household Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {households.length} households
            </p>
          </div>
          <Button
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={openCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Household
          </Button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search household or purok..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {/* Household list */}
        <div className="divide-y">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground">
              <Home className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No households found
            </div>
          ) : (
            filtered.map((h) => {
              const isExpanded = expandedId === h.id;
              return (
                <div key={h.id}>
                  <div className="flex items-center gap-3 px-5 py-4 hover:bg-muted/20 transition-colors">
                    <button
                      onClick={() => toggleExpand(h.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Home className="h-4 w-4 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">
                          {householdLabel(h)}
                        </p>
                        {h.headName && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">
                            <Crown className="h-2.5 w-2.5" /> {h.headName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {householdAddress(h)} · {h.memberCount} member
                        {h.memberCount !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <Badge
                      variant="secondary"
                      className="text-xs shrink-0 hidden sm:flex"
                    >
                      {h.memberCount}{" "}
                      {h.memberCount === 1 ? "member" : "members"}
                    </Badge>

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
                        <DropdownMenuItem onClick={() => openEdit(h)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(h)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {isExpanded && (
                    <div className="bg-muted/20 border-t px-5 py-3 space-y-2">
                      {h.members.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">
                          No members assigned to this household yet.
                        </p>
                      ) : (
                        <>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                            Members
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {h.members.map((m) => {
                              const isHead = m.id === h.headResidentId;
                              const initials =
                                `${m.firstName[0]}${m.lastName[0]}`.toUpperCase();
                              return (
                                <div
                                  key={m.id}
                                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-card border"
                                >
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${m.sex === "male" ? "bg-blue-500/10 text-blue-600" : "bg-pink-500/10 text-pink-600"}`}
                                  >
                                    {initials}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-medium truncate">
                                        {m.firstName} {m.lastName}
                                      </p>
                                      {isHead && (
                                        <Crown className="h-2.5 w-2.5 text-amber-500 shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                      {getAge(m.birthDate)} yrs ·{" "}
                                      <span className="capitalize">
                                        {m.sex}
                                      </span>
                                    </p>
                                  </div>
                                  {m.isVerified && (
                                    <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                                      Verified
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">
              {editTarget ? "Edit Household" : "Add Household"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update household details."
                : "Create a new household and assign a head of family."}
            </DialogDescription>
          </DialogHeader>
          <HouseholdForm
            household={editTarget}
            defaultHeadResident={
              editTarget ? getHeadResident(editTarget) : null
            }
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
              Delete{" "}
              {deleteTarget ? householdLabel(deleteTarget) : "this household"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will unlink all members from this household. The residents
              themselves will not be deleted.
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
