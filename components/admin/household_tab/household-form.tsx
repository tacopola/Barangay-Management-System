"use client";

import { useActionState, useEffect } from "react";

import {
  createHouseholdAction,
  updateHouseholdAction,
  searchResidentsAction,
  type HouseholdFormState,
} from "@/actions/admin/household";

import { AsyncSearchSelect } from "@/components/shared/async-search-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Crown, Home, Loader2, User } from "lucide-react";

type Household = {
  id: string;
  houseNumber: string | null;
  streetPurok: string | null;
  headResidentId: string | null;
};

type SimpleResident = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
};

const initialState: HouseholdFormState = {};

function residentFullName(r: SimpleResident) {
  return [r.firstName, r.middleName, r.lastName, r.suffix]
    .filter(Boolean)
    .join(" ");
}

export function HouseholdForm({
  household,
  defaultHeadResident,
  onSuccess,
}: {
  household?: Household | null;

  defaultHeadResident?: SimpleResident | null;

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

      {/* Head resident */}
      <div className="space-y-1.5">
        <Label>
          Head of Household{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>

        <AsyncSearchSelect<SimpleResident>
          name="headResidentId"
          defaultValue={defaultHeadResident}
          searchAction={searchResidentsAction}
          getItemId={(r) => r.id}
          getItemLabel={(r) => residentFullName(r)}
          placeholder="Search by name..."
          emptyMessage="No residents found"
          fieldError={state.fieldErrors?.headResidentId}
          helperText="You can assign this later."
          renderItem={(r) => (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

              <span className="text-sm">{residentFullName(r)}</span>
            </div>
          )}
          renderSelected={(r) => (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                <Crown className="h-4 w-4 text-amber-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {residentFullName(r)}
                </p>

                <p className="text-xs text-muted-foreground">
                  Head of household
                </p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Global error */}
      {state.error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending} className="min-w-28">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {household ? "Save Changes" : "Create Household"}
        </Button>
      </div>
    </form>
  );
}
