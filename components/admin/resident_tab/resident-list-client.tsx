"use client";

import { useState, useTransition, useMemo } from "react";
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
  MoreHorizontal,
  Pencil,
  Archive,
  CheckCircle,
  Users,
  UserCheck,
  Vote,
  Eye,
} from "lucide-react";
import {
  toggleVerifyResidentAction,
  archiveResidentAction,
} from "@/actions/admin/resident";
import { ResidentForm } from "./resident-form";
import { toast } from "sonner";
import Link from "next/link";

type Resident = {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  suffix: string | null
  sex: string
  birthDate: string
  birthPlace: string | null
  civilStatus: string
  nationality: string | null
  religion: string | null
  occupation: string | null
  contactNumber: string | null
  email: string | null
  householdId: string | null
  isVerified: boolean | null
  isArchived: boolean | null
  isSeniorCitizen: boolean | null
  isPwd: boolean | null
  pwdType: string | null
  isSoloParent: boolean | null
  isRegisteredVoter: boolean | null
  voterIdNumber: string | null
  isIndigenousPeople: boolean | null
  userId: string | null
  createdAt: Date
}

type Household = {
  id: string;
  streetPurok: string | null;
  houseNumber: string | null;
};

type StatusFilter = "all" | "active" | "archived";
type VerifyFilter = "all" | "verified" | "unverified";

export function ResidentListClient({
  residents,
  households,
}: {
  residents: Resident[];
  households: Household[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [verifyFilter, setVerifyFilter] = useState<VerifyFilter>("all");
  const [sexFilter, setSexFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Resident | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Resident | null>(null);
  const [isPending, startTransition] = useTransition();
  const now = useMemo(() => new Date(), []);

  const filtered = residents.filter((r) => {
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      r.contactNumber?.includes(search);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !r.isArchived) ||
      (statusFilter === "archived" && r.isArchived);
    const matchVerify =
      verifyFilter === "all" ||
      (verifyFilter === "verified" && r.isVerified) ||
      (verifyFilter === "unverified" && !r.isVerified);
    const matchSex = sexFilter === "all" || r.sex === sexFilter;
    return matchSearch && matchStatus && matchVerify && matchSex;
  });

  const totalActive = residents.filter((r) => !r.isArchived).length;
  const totalVerified = residents.filter(
    (r) => r.isVerified && !r.isArchived,
  ).length;
  const totalVoters = residents.filter(
    (r) => r.isRegisteredVoter && !r.isArchived,
  ).length;

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(r: Resident) {
    setEditTarget(r);
    setDialogOpen(true);
  }

function handleToggleVerify(r: Resident) {
  startTransition(async () => {
    const res = await toggleVerifyResidentAction(r.id, r.isVerified ?? false)
    if (res.error) toast.error(res.error)
    else toast.success(`${r.firstName} ${r.lastName} ${r.isVerified ? "unverified" : "verified"}.`)
    router.refresh()
  })
}

  function handleArchive() {
    if (!archiveTarget) return;
    startTransition(async () => {
      const res = await archiveResidentAction(archiveTarget.id, archiveTarget.isArchived ?? false)
      if (res.error) toast.error(res.error);
      else
        toast.success(
          `${archiveTarget.firstName} ${archiveTarget.lastName} ${archiveTarget.isArchived ? "restored" : "archived"}.`,
        );
      setArchiveTarget(null);
      router.refresh();
    });
  }

  const fullName = (r: Resident) =>
    `${r.lastName}, ${r.firstName}${r.middleName ? " " + r.middleName[0] + "." : ""}${r.suffix ? " " + r.suffix : ""}`;

  const initials = (r: Resident) =>
    `${r.firstName[0]}${r.lastName[0]}`.toUpperCase();

  const getAge = (birthDate: string) => {
    const diff = now.getTime() - new Date(birthDate).getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="h-4 w-4 text-primary" />}
          label="Total Residents"
          value={totalActive}
          accent="border-t-primary"
        />
        <StatCard
          icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
          label="Verified"
          value={totalVerified}
          accent="border-t-emerald-500"
        />
        <StatCard
          icon={<Vote className="h-4 w-4 text-blue-600" />}
          label="Registered Voters"
          value={totalVoters}
          accent="border-t-blue-500"
        />
      </div>

      {/* Table card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b gap-4">
          <div>
            <h2 className="text-sm font-semibold">Resident Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} of {residents.length} residents
            </p>
          </div>
          <Button
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={openCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            Register Resident
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-3 border-b flex-wrap">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <TabsList className="h-8">
              <TabsTrigger value="active" className="text-xs px-3">
                Active
              </TabsTrigger>
              <TabsTrigger value="archived" className="text-xs px-3">
                Archived
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-3">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={verifyFilter}
            onValueChange={(v) => setVerifyFilter(v as VerifyFilter)}
          >
            <SelectTrigger className="h-8 text-xs w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Status
              </SelectItem>
              <SelectItem value="verified" className="text-xs">
                Verified
              </SelectItem>
              <SelectItem value="unverified" className="text-xs">
                Unverified
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={sexFilter} onValueChange={setSexFilter}>
            <SelectTrigger className="h-8 text-xs w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Sex
              </SelectItem>
              <SelectItem value="male" className="text-xs">
                Male
              </SelectItem>
              <SelectItem value="female" className="text-xs">
                Female
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="relative ml-auto w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name or number..."
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
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">
                  Age / Sex
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">
                  Contact
                </th>
                <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden lg:table-cell">
                  Tags
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
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No residents found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${r.sex === "male" ? "bg-blue-500/10 text-blue-600" : "bg-pink-500/10 text-pink-600"}`}
                        >
                          {initials(r)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{fullName(r)}</p>
                          {r.occupation && (
                            <p className="text-xs text-muted-foreground">
                              {r.occupation}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="text-sm">{getAge(r.birthDate)} yrs</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {r.sex}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-muted-foreground">
                        {r.contactNumber ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {r.isSeniorCitizen && (
                          <Tag label="Senior" color="amber" />
                        )}
                        {r.isPwd && <Tag label="PWD" color="purple" />}
                        {r.isSoloParent && <Tag label="Solo" color="pink" />}
                        {r.isRegisteredVoter && (
                          <Tag label="Voter" color="blue" />
                        )}
                        {r.userId && <Tag label="Portal" color="green" />}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {r.isArchived ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Archived
                        </Badge>
                      ) : r.isVerified ? (
                        <Badge variant="default" className="text-[10px]">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Unverified
                        </Badge>
                      )}
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
                            <Link href={`/admin/residents/${r.id}`}>
                              <Eye className="h-3.5 w-3.5 mr-2" /> View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(r)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleVerify(r)}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-2" />
                            {r.isVerified ? "Unverify" : "Verify"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setArchiveTarget(r)}
                          >
                            <Archive className="h-3.5 w-3.5 mr-2" />
                            {r.isArchived ? "Restore" : "Archive"}
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

      {/* Register / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">
              {editTarget ? "Edit Resident" : "Register Resident"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update resident information."
                : "Fill in the resident's personal details."}
            </DialogDescription>
          </DialogHeader>
          <ResidentForm
            resident={editTarget}
            households={households}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Archive confirm */}
      <AlertDialog
        open={!!archiveTarget}
        onOpenChange={(o) => !o && setArchiveTarget(null)}
      >
        <AlertDialogContent className="p-8">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {archiveTarget?.isArchived ? "Restore" : "Archive"}{" "}
              {archiveTarget?.firstName} {archiveTarget?.lastName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {archiveTarget?.isArchived
                ? "This will restore the resident and make them active again."
                : "This will archive the resident. They won't appear in active lists but their records are preserved."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              {archiveTarget?.isArchived ? "Restore" : "Archive"}
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

function Tag({ label, color }: { label: string; color: string }) {
  const styles: Record<string, string> = {
    amber: "bg-amber-500/10 text-amber-700",
    purple: "bg-purple-500/10 text-purple-700",
    pink: "bg-pink-500/10 text-pink-700",
    blue: "bg-blue-500/10 text-blue-700",
    green: "bg-emerald-500/10 text-emerald-700",
  };
  return (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${styles[color] ?? ""}`}
    >
      {label}
    </span>
  );
}
