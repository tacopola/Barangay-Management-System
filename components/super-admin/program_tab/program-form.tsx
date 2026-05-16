"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  createProgramAction,
  updateProgramAction,
} from "@/actions/super_admin/program";
import { toast } from "sonner";

const PROGRAM_TYPES = [
  { value: "4ps", label: "4Ps (Pantawid Pamilya)" },
  { value: "senior_citizen", label: "Senior Citizen" },
  { value: "pwd", label: "PWD" },
  { value: "solo_parent", label: "Solo Parent" },
  { value: "indigent", label: "Indigent" },
];

type Program = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  barangayId: string | null;
};

type Barangay = { id: string; name: string };

export function ProgramForm({
  program,
  barangays,
  onSuccess,
}: {
  program?: Program | null;
  barangays: Barangay[];
  onSuccess?: () => void;
}) {
  const action = program
    ? updateProgramAction.bind(null, program.id)
    : createProgramAction;

  const [state, formAction, isPending] = useActionState(action, {});
  const [type, setType] = useState(program?.type ?? "");
  const [barangayId, setBarangayId] = useState(program?.barangayId ?? "");

  useEffect(() => {
    if (state.success) {
      toast.success(program ? "Program updated." : "Program created.");
      onSuccess?.();
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Program name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-medium">
          Program Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. 4Ps Brgy. San Lorenzo"
          defaultValue={program?.name}
          className="h-9 text-sm"
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      {/* Program type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Program Type <span className="text-destructive">*</span>
        </Label>
        <Select name="type" value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            {PROGRAM_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="text-sm">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.type && (
          <p className="text-xs text-destructive">{state.fieldErrors.type}</p>
        )}
      </div>

      {/* Barangay */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Barangay <span className="text-destructive">*</span>
        </Label>
        <Select
          name="barangayId"
          value={barangayId}
          onValueChange={setBarangayId}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select barangay..." />
          </SelectTrigger>
          <SelectContent>
            {barangays.map((b) => (
              <SelectItem key={b.id} value={b.id} className="text-sm">
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.barangayId && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.barangayId}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-medium">
          Description <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Brief description of the program..."
          defaultValue={program?.description ?? ""}
          className="text-sm resize-none"
          rows={3}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : program ? (
            "Save Changes"
          ) : (
            "Create Program"
          )}
        </Button>
      </div>
    </form>
  );
}
