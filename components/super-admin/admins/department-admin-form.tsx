"use client";

import { useActionState, useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2, Eye, EyeOff } from "lucide-react";

import {
  createDepartmentAdminAction,
  updateDepartmentAdminAction,
} from "@/actions/super_admin/admin";

import { toast } from "sonner";

type Department = {
  id: string;
  name: string;
  type: string;
};

type DepartmentAdmin = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  email: string | null;
  phoneNumber: string | null;
  departmentId: string | null;
};

export function DepartmentAdminForm({
  admin,
  departments,
  onSuccess,
}: {
  admin?: DepartmentAdmin | null;
  departments: Department[];
  onSuccess?: () => void;
}) {
  const action = admin
    ? updateDepartmentAdminAction.bind(null, admin.id)
    : createDepartmentAdminAction;

  const [state, formAction, isPending] = useActionState(action, {});

  const [showPassword, setShowPassword] = useState(false);

  const [departmentId, setDepartmentId] = useState(admin?.departmentId ?? "");

  useEffect(() => {
    if (state.success) {
      toast.success(
        admin ? "Department admin updated." : "Department admin created.",
      );

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

      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="First Name"
          name="firstName"
          placeholder="Juan"
          defaultValue={admin?.firstName}
          error={state.fieldErrors?.firstName}
          required
        />

        <Field
          label="Middle Name"
          name="middleName"
          placeholder="Santos"
          defaultValue={admin?.middleName ?? ""}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Field
            label="Last Name"
            name="lastName"
            placeholder="Dela Cruz"
            defaultValue={admin?.lastName}
            error={state.fieldErrors?.lastName}
            required
          />
        </div>

        <Field
          label="Suffix"
          name="suffix"
          placeholder="Jr."
          defaultValue={admin?.suffix ?? ""}
        />
      </div>

      {/* Department */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Department <span className="text-destructive">*</span>
        </Label>

        <Select
          name="departmentId"
          value={departmentId}
          onValueChange={setDepartmentId}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select department..." />
          </SelectTrigger>

          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id} className="text-sm">
                <div className="flex flex-col">
                  <span>{d.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {state.fieldErrors?.departmentId && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.departmentId}
          </p>
        )}
      </div>

      {/* Email */}
      <Field
        label="Email Address"
        name="email"
        type="email"
        placeholder="admin@department.gov.ph"
        defaultValue={admin?.email ?? ""}
        error={state.fieldErrors?.email}
        required
      />

      {/* Phone */}
      <Field
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        placeholder="09XX XXX XXXX"
        defaultValue={admin?.phoneNumber ?? ""}
        error={state.fieldErrors?.phoneNumber}
        required
      />

      {/* Password */}
      {!admin && (
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-medium">
            Password <span className="text-destructive">*</span>
          </Label>

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              className="h-9 text-sm pr-10"
            />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              tabIndex={-1}
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {state.fieldErrors?.password && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.password}
            </p>
          )}
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : admin ? (
            "Save Changes"
          ) : (
            "Create Account"
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
