"use client";

import { useActionState, useEffect } from "react";
import {
  createHouseholdAction,
  updateHouseholdAction,
  type HouseholdFormState,
} from "@/actions/admin/household";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Loader2, Home, Crown } from "lucide-react";

type Household = {
  id: string;
  houseNumber: string | null;
  streetPurok: string | null;
  headResidentId: string | null;
};

type SimpleResident = {
  id: string;
  firstName: string;
  lastName: string;
};

const initialState: HouseholdFormState = {};

export function HouseholdForm({
  household,
  allResidents,
  onSuccess,
}: {
  household?: Household | null;
  allResidents: SimpleResident[];
  onSuccess?: () => void;
}) {
  const action = household
    ? updateHouseholdAction.bind(null, household.id)
    : createHouseholdAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-5">
      {/* House number */}
      <div className="space-y-2">
        <Label htmlFor="houseNumber">House Number</Label>

        <div className="relative">
          <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="houseNumber"
            name="houseNumber"
            placeholder="e.g. 123"
            defaultValue={household?.houseNumber ?? ""}
            className="pl-9"
          />
        </div>

        {state.fieldErrors?.houseNumber && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.houseNumber}
          </p>
        )}
      </div>

      {/* Street / purok */}
      <div className="space-y-2">
        <Label htmlFor="streetPurok">
          Street / Purok <span className="text-destructive">*</span>
        </Label>

        <Input
          id="streetPurok"
          name="streetPurok"
          placeholder="e.g. Purok 3"
          defaultValue={household?.streetPurok ?? ""}
        />

        {state.fieldErrors?.streetPurok && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.streetPurok}
          </p>
        )}
      </div>

      {/* Head of household */}
      <div className="space-y-2">
        <Label>Head of Household</Label>

        <Select
          name="headResidentId"
          defaultValue={household?.headResidentId ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select resident" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="none">No head assigned</SelectItem>

            {allResidents.map((resident) => (
              <SelectItem key={resident.id} value={resident.id}>
                <div className="flex items-center gap-2">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  {resident.firstName} {resident.lastName}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {state.fieldErrors?.headResidentId && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.headResidentId}
          </p>
        )}

        <p className="text-[11px] text-muted-foreground">
          Optional. You can assign this later.
        </p>
      </div>

      {/* Global error */}
      {state.error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending} className="min-w-28">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {household ? "Save Changes" : "Create Household"}
        </Button>
      </div>
    </form>
  );
}
