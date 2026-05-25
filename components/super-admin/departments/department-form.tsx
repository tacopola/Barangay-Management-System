"use client";

import { useActionState, useEffect } from "react";
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
  createDepartmentAction,
  updateDepartmentAction,
} from "@/actions/super_admin/department";

import { departmentTypeEnum } from "@/db/schema/enums";

import { toast } from "sonner";

type Department = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  contactNumber: string | null;
  email: string | null;
};

const departmentTypeLabels: Record<string, string> = {
  treasury: "Treasury",
  health: "Health",
  agriculture: "Agriculture",
  engineering: "Engineering",
  social_welfare: "Social Welfare",
  civil_registry: "Civil Registry",
  budget: "Budget",
  accounting: "Accounting",
  assessor: "Assessor",
  hr: "Human Resources",
  planning: "Planning",
  mayor_office: "Mayor's Office",
  vice_mayor_office: "Vice Mayor's Office",
  sb_office: "Sangguniang Bayan Office",
};

export function DepartmentForm({
  department,
  onSuccess,
}: {
  department?: Department | null;
  onSuccess?: () => void;
}) {
  const action = department
    ? updateDepartmentAction.bind(null, department.id)
    : createDepartmentAction;

  const [state, formAction, isPending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) {
      toast.success(department ? "Department updated." : "Department created.");

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

      <Field
        label="Department Name"
        name="name"
        required
        placeholder="e.g. Municipal Health Office"
        defaultValue={department?.name}
        error={state.fieldErrors?.name}
      />

      {/* Department Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Department Type <span className="text-destructive">*</span>
        </Label>

        <Select name="type" defaultValue={department?.type}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select department type..." />
          </SelectTrigger>

          <SelectContent>
            {departmentTypeEnum.enumValues.map((type) => (
              <SelectItem key={type} value={type} className="text-sm">
                {departmentTypeLabels[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {state.fieldErrors?.type && (
          <p className="text-xs text-destructive">{state.fieldErrors.type}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-medium">
          Description
        </Label>

        <Textarea
          id="description"
          name="description"
          placeholder="Brief description of the department..."
          defaultValue={department?.description ?? ""}
          className="min-h-[100px] text-sm"
        />
      </div>

      {/* Contact Row */}
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Contact Number"
          name="contactNumber"
          placeholder="09XX XXX XXXX"
          defaultValue={department?.contactNumber ?? ""}
          error={state.fieldErrors?.contactNumber}
        />

        <Field
          label="Email Address"
          name="email"
          type="email"
          placeholder="department@municipality.gov.ph"
          defaultValue={department?.email ?? ""}
          error={state.fieldErrors?.email}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : department ? (
            "Save Changes"
          ) : (
            "Create Department"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  defaultValue,
  error,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-9 text-sm"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
