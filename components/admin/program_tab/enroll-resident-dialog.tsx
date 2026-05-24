"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  enrollBeneficiaryAction,
  searchEligibleResidentsAction,
} from "@/actions/admin/program";
import type { EnrollFormState } from "@/actions/admin/program";
import { Loader2, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Resident = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  contactNumber: string | null;
};

type EnrollResidentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
};

const initialState: EnrollFormState = {};

export function EnrollResidentDialog({
  open,
  onOpenChange,
  programId,
}: EnrollResidentDialogProps) {
  const boundAction = enrollBeneficiaryAction.bind(null, programId);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState,
  );

  const [search, setSearch] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null,
  );
  const [isSearching, startSearch] = useTransition();
  const residentIdRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
      resetForm();
    }
  }, [state.success, onOpenChange]);

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  useEffect(() => {
    if (!search.trim()) {
      setResidents([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      startSearch(async () => {
        const results = await searchEligibleResidentsAction(programId, search);
        setResidents(results);
      });
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search, programId]);

  function resetForm() {
    setSearch("");
    setResidents([]);
    setSelectedResident(null);
    if (residentIdRef.current) residentIdRef.current.value = "";
  }

  function selectResident(r: Resident) {
    setSelectedResident(r);
    setSearch("");
    setResidents([]);
    if (residentIdRef.current) residentIdRef.current.value = r.id;
  }

  const fullName = (r: Resident) =>
    [r.firstName, r.middleName, r.lastName, r.suffix].filter(Boolean).join(" ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll Beneficiary</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="residentId" ref={residentIdRef} />

          {/* Resident search */}
          <div className="space-y-1.5">
            <Label>Resident</Label>
            {selectedResident ? (
              <div className="flex items-center gap-3 rounded-md border px-3 py-2 bg-muted/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fullName(selectedResident)}
                  </p>
                  {selectedResident.contactNumber && (
                    <p className="text-xs text-muted-foreground">
                      {selectedResident.contactNumber}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedResident(null)}
                  className="h-7 px-2 text-muted-foreground"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
                {(isSearching || residents.length > 0) && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : residents.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        No residents found
                      </p>
                    ) : (
                      residents.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => selectResident(r)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors",
                            "flex items-center gap-2",
                          )}
                        >
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{fullName(r)}</span>
                          {r.contactNumber && (
                            <span className="text-muted-foreground text-xs ml-auto">
                              {r.contactNumber}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            {state.fieldErrors?.residentId && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.residentId}
              </p>
            )}
          </div>

          {/* Enrollment date */}
          <div className="space-y-1.5">
            <Label htmlFor="enrolledAt">Enrollment Date</Label>
            <Input
              id="enrolledAt"
              name="enrolledAt"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            {state.fieldErrors?.enrolledAt && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.enrolledAt}
              </p>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label htmlFor="remarks">
              Remarks{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="remarks"
              name="remarks"
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !selectedResident}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enroll Resident
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
