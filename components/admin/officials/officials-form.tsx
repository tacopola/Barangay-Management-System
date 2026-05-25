"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createOfficialAction,
  updateOfficialAction,
  searchResidentsAction,
  type OfficialFormState,
} from "@/actions/barangay-admin/official";

import { AsyncSearchSelect } from "@/components/shared/async-search-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Crown, Loader2, ShieldCheck, User } from "lucide-react";

type Official = {
  id: string;
  residentId: string | null;
  position: string;
  termStart: string;
  termEnd: string | null;
  isActive: boolean;
};

type SimpleResident = {
  id: string;
  firstName: string;
  lastName: string;
};

export const POSITION_LABELS: Record<string, string> = {
  punong_barangay: "Punong Barangay",

  kagawad: "Kagawad",

  sk_chairperson: "SK Chairperson",

  sk_kagawad: "SK Kagawad",

  barangay_secretary: "Barangay Secretary",

  barangay_treasurer: "Barangay Treasurer",

  tanod: "Tanod",
};

const POSITIONS = Object.entries(POSITION_LABELS);

const initialState: OfficialFormState = {};

function residentFullName(r: SimpleResident) {
  return [r.firstName, r.lastName].join(" ");
}

export function OfficialForm({
  official,
  defaultResident,
  onSuccess,
}: {
  official?: Official | null;

  defaultResident?: SimpleResident | null;

  onSuccess?: () => void;
}) {
  const action = official
    ? updateOfficialAction.bind(null, official.id)
    : createOfficialAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  const isActiveRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-5">
      {/* Resident */}
      <div className="space-y-1.5">
        <Label>Resident</Label>

        <AsyncSearchSelect<SimpleResident>
          name="residentId"
          defaultValue={defaultResident}
          searchAction={searchResidentsAction}
          getItemId={(r) => r.id}
          getItemLabel={(r) => residentFullName(r)}
          placeholder="Search resident..."
          emptyMessage="No residents found"
          fieldError={state.fieldErrors?.residentId}
          helperText="Optional resident link."
          renderItem={(r) => (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

              <span className="text-sm">{residentFullName(r)}</span>
            </div>
          )}
          renderSelected={(r) => (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Crown className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {residentFullName(r)}
                </p>

                <p className="text-xs text-muted-foreground">Linked resident</p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Position */}
      <div className="space-y-2">
        <Label>
          Position <span className="text-destructive">*</span>
        </Label>

        <Select name="position" defaultValue={official?.position ?? ""}>
          <SelectTrigger>
            <SelectValue placeholder="Select position" />
          </SelectTrigger>

          <SelectContent>
            {POSITIONS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />

                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {state.fieldErrors?.position && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.position}
          </p>
        )}
      </div>

      {/* Term dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="termStart">
            Term Start <span className="text-destructive">*</span>
          </Label>

          <Input
            id="termStart"
            name="termStart"
            type="date"
            defaultValue={official?.termStart ?? ""}
          />

          {state.fieldErrors?.termStart && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.termStart}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="termEnd">Term End</Label>

          <Input
            id="termEnd"
            name="termEnd"
            type="date"
            defaultValue={official?.termEnd ?? ""}
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
        <div>
          <p className="text-sm font-medium">Active</p>

          <p className="text-xs text-muted-foreground">
            Inactive officials won&apos;t appear in the org chart.
          </p>
        </div>

        <input
          ref={isActiveRef}
          type="hidden"
          name="isActive"
          defaultValue={official?.isActive !== false ? "true" : "false"}
        />

        <Switch
          defaultChecked={official?.isActive !== false}
          onCheckedChange={(checked) => {
            if (isActiveRef.current) {
              isActiveRef.current.value = String(checked);
            }
          }}
        />
      </div>

      {/* Global error */}
      {state.error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending} className="min-w-28">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {official ? "Save Changes" : "Add Official"}
        </Button>
      </div>
    </form>
  );
}
