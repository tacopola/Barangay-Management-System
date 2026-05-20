"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  createBlotterAction,
  updateBlotterAction,
} from "@/actions/admin/blotter";
import { toast } from "sonner";

type BlotterCase = {
  id: string;
  complainantName: string | null;
  complainantId: string | null;
  respondentName: string | null;
  respondentId: string | null;
  incidentDate: string;
  incidentLocation: string | null;
  narrative: string;
};

type SimpleResident = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
};

export function BlotterForm({
  blotterCase,
  residents,
  onSuccess,
}: {
  blotterCase?: BlotterCase | null;
  residents: SimpleResident[];
  onSuccess?: () => void;
}) {
  const action = blotterCase
    ? updateBlotterAction.bind(null, blotterCase.id)
    : createBlotterAction;

  const [state, formAction, isPending] = useActionState(action, {});
  const [complainantId, setComplainantId] = useState(
    blotterCase?.complainantId ?? "",
  );
  const [respondentId, setRespondentId] = useState(
    blotterCase?.respondentId ?? "",
  );

  useEffect(() => {
    if (state.success) {
      toast.success(blotterCase ? "Case updated." : "Blotter case filed.");
      onSuccess?.();
    }
  }, [state.success]);

  const residentOptions = residents.map((r) => ({
    value: r.id,
    label: `${r.lastName}, ${r.firstName}${r.middleName ? " " + r.middleName[0] + "." : ""}`,
  }));

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Complainant */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Complainant
          </p>
          <Separator className="mt-1.5" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            Registered Resident (optional)
          </Label>
          <Select
            name="complainantId"
            value={complainantId}
            onValueChange={setComplainantId}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select resident or leave blank..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-sm">
                Not a registered resident
              </SelectItem>
              {residentOptions.map((r) => (
                <SelectItem key={r.value} value={r.value} className="text-sm">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(!complainantId || complainantId === "none") && (
          <div className="space-y-1.5">
            <Label htmlFor="complainantName" className="text-xs font-medium">
              Complainant Name
            </Label>
            <Input
              id="complainantName"
              name="complainantName"
              placeholder="Full name of complainant"
              defaultValue={blotterCase?.complainantName ?? ""}
              className="h-9 text-sm"
            />
          </div>
        )}
      </div>

      {/* Respondent */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Respondent
          </p>
          <Separator className="mt-1.5" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">
            Registered Resident (optional)
          </Label>
          <Select
            name="respondentId"
            value={respondentId}
            onValueChange={setRespondentId}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select resident or leave blank..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-sm">
                Not a registered resident
              </SelectItem>
              {residentOptions.map((r) => (
                <SelectItem key={r.value} value={r.value} className="text-sm">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="respondentName" className="text-xs font-medium">
            Respondent Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="respondentName"
            name="respondentName"
            placeholder="Full name of respondent"
            defaultValue={blotterCase?.respondentName ?? ""}
            className="h-9 text-sm"
          />
          {state.fieldErrors?.respondentName && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.respondentName}
            </p>
          )}
        </div>
      </div>

      {/* Incident details */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Incident Details
          </p>
          <Separator className="mt-1.5" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="incidentDate" className="text-xs font-medium">
              Incident Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="incidentDate"
              name="incidentDate"
              type="date"
              defaultValue={blotterCase?.incidentDate ?? ""}
              className="h-9 text-sm"
            />
            {state.fieldErrors?.incidentDate && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.incidentDate}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="incidentLocation" className="text-xs font-medium">
              Location <span className="text-destructive">*</span>
            </Label>
            <Input
              id="incidentLocation"
              name="incidentLocation"
              placeholder="Where did it happen?"
              defaultValue={blotterCase?.incidentLocation ?? ""}
              className="h-9 text-sm"
            />
            {state.fieldErrors?.incidentLocation && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.incidentLocation}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="narrative" className="text-xs font-medium">
            Narrative <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="narrative"
            name="narrative"
            placeholder="Describe what happened in detail..."
            defaultValue={blotterCase?.narrative ?? ""}
            rows={5}
            className="text-sm resize-none"
          />
          {state.fieldErrors?.narrative && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.narrative}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : blotterCase ? (
          "Save Changes"
        ) : (
          "File Case"
        )}
      </Button>
    </form>
  );
}
