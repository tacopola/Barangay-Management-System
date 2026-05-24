"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EnrollResidentDialog } from "./enroll-resident-dialog";
import { removeBeneficiaryAction } from "@/actions/admin/program";
import { PROGRAM_TYPES, PROGRAM_TYPE_COLORS } from "./program-type-colors";
import {
  Users,
  UserMinus,
  UserPlus,
  MoreHorizontal,
  Search,
  Loader2,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";


type Beneficiary = {
  id: string;
  residentId: string;
  enrolledAt: string;
  removedAt: string | null;
  removalReason: string | null;
  remarks: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;
  contactNumber: string | null;
  isSeniorCitizen: boolean | null;
  isPwd: boolean | null;
  isSoloParent: boolean | null;
};

type Program = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  isActive: boolean;
};

type ProgramDetailClientProps = {
  program: Program;
  beneficiaries: Beneficiary[];
};


function fullName(
  b: Pick<Beneficiary, "firstName" | "middleName" | "lastName" | "suffix">,
) {
  return [b.firstName, b.middleName, b.lastName, b.suffix]
    .filter(Boolean)
    .join(" ");
}

function formatDate(d: string | null) {
  if (!d) return "—";
  try {
    return format(new Date(d), "MMM d, yyyy");
  } catch {
    return d;
  }
}


type RemoveDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  beneficiary: Beneficiary | null;
  programId: string;
};

function RemoveBeneficiaryDialog({
  open,
  onOpenChange,
  beneficiary,
  programId,
}: RemoveDialogProps) {
  const boundAction = beneficiary
    ? removeBeneficiaryAction.bind(null, beneficiary.id, programId)
    : null;

  const [state, formAction, isPending] = useActionState(
    boundAction ?? (async () => ({})),
    {},
  );

  useEffect(() => {
    if ((state as { success?: boolean }).success) {
      onOpenChange(false);
      toast.success("Beneficiary removed.");
    }
  }, [state, onOpenChange]);

  if (!beneficiary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Remove Beneficiary</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are removing{" "}
            <span className="font-medium text-foreground">
              {fullName(beneficiary)}
            </span>{" "}
            from this program. Please provide a reason.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="removalReason">Reason</Label>
            <Textarea
              id="removalReason"
              name="removalReason"
              placeholder="e.g. No longer eligible, transferred, etc."
              rows={3}
            />
            {(state as { error?: string }).error && (
              <p className="text-xs text-destructive">
                {(state as { error?: string }).error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProgramDetailClient({
  program,
  beneficiaries,
}: ProgramDetailClientProps) {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Beneficiary | null>(null);
  const [search, setSearch] = useState("");

  const active = beneficiaries.filter((b) => !b.removedAt);
  const removed = beneficiaries.filter((b) => !!b.removedAt);

  const filteredActive = active.filter(
    (b) => !search || fullName(b).toLowerCase().includes(search.toLowerCase()),
  );
  const filteredRemoved = removed.filter(
    (b) => !search || fullName(b).toLowerCase().includes(search.toLowerCase()),
  );

  const typeLabel =
    PROGRAM_TYPES.find((t) => t.value === program.type)?.label ?? program.type;
  const typeColor =
    PROGRAM_TYPE_COLORS[program.type] ?? PROGRAM_TYPE_COLORS.other;

  return (
    <>
      {/* Program info card — read-only */}
      <div className="rounded-lg border bg-card p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full border",
                typeColor,
              )}
            >
              {typeLabel}
            </span>
            <Badge variant={program.isActive ? "default" : "secondary"}>
              {program.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          {program.description && (
            <p className="text-sm text-muted-foreground max-w-lg">
              {program.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {active.length} active{" "}
              {active.length === 1 ? "beneficiary" : "beneficiaries"}
            </span>
            {removed.length > 0 && (
              <span className="flex items-center gap-1.5">
                <UserMinus className="h-3.5 w-3.5" />
                {removed.length} removed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Beneficiaries section */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-medium text-sm">Beneficiaries</h2>
          <Button size="sm" onClick={() => setEnrollOpen(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-2" />
            Enroll Resident
          </Button>
        </div>

        <div className="px-5 py-3 border-b">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search beneficiaries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <div className="px-5 pt-3">
            <TabsList className="h-8">
              <TabsTrigger value="active" className="text-xs">
                Active ({active.length})
              </TabsTrigger>
              <TabsTrigger value="removed" className="text-xs">
                Removed ({removed.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Active beneficiaries */}
          <TabsContent value="active" className="mt-0">
            {filteredActive.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No active beneficiaries</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search
                    ? "Try a different search."
                    : "Enroll residents to get started."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActive.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{fullName(b)}</p>
                          {b.contactNumber && (
                            <p className="text-xs text-muted-foreground">
                              {b.contactNumber}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {b.isSeniorCitizen && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              Senior
                            </Badge>
                          )}
                          {b.isPwd && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              PWD
                            </Badge>
                          )}
                          {b.isSoloParent && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              Solo Parent
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(b.enrolledAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                        {b.remarks ?? "—"}
                      </TableCell>
                      <TableCell>
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
                              className="text-destructive focus:text-destructive"
                              onClick={() => setRemoveTarget(b)}
                            >
                              <UserMinus className="h-3.5 w-3.5 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Removed beneficiaries */}
          <TabsContent value="removed" className="mt-0">
            {filteredRemoved.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No removed beneficiaries</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Removed beneficiaries will appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Removed</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRemoved.map((b) => (
                    <TableRow key={b.id} className="opacity-60">
                      <TableCell>
                        <p className="font-medium text-sm">{fullName(b)}</p>
                        {b.contactNumber && (
                          <p className="text-xs text-muted-foreground">
                            {b.contactNumber}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(b.enrolledAt)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(b.removedAt)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                        {b.removalReason ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <EnrollResidentDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        programId={program.id}
      />
      <RemoveBeneficiaryDialog
        open={!!removeTarget}
        onOpenChange={(v) => {
          if (!v) setRemoveTarget(null);
        }}
        beneficiary={removeTarget}
        programId={program.id}
      />
    </>
  );
}
