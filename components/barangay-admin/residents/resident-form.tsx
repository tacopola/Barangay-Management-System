"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  createResidentAction,
  updateResidentAction,
} from "@/actions/barangay-admin/resident";
import { toast } from "sonner";

type Resident = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  sex: string;
  birthDate: string;
  birthPlace: string | null;
  civilStatus: string;
  nationality: string | null;
  religion: string | null;
  occupation: string | null;
  contactNumber: string | null;
  email: string | null;
  householdId: string | null;
  isRegisteredVoter: boolean | null;
  voterIdNumber: string | null;
  isIndigenousPeople: boolean | null;
  isSeniorCitizen: boolean | null;
  isPwd: boolean | null;
  pwdType: string | null;
  isSoloParent: boolean | null;
};

type Household = {
  id: string;
  streetPurok: string | null;
  houseNumber: string | null;
};

export function ResidentForm({
  resident,
  households,
  onSuccess,
}: {
  resident?: Resident | null;
  households: Household[];
  onSuccess?: () => void;
}) {
  const action = resident
    ? updateResidentAction.bind(null, resident.id)
    : createResidentAction;

  const [state, formAction, isPending] = useActionState(action, {});
  const [sex, setSex] = useState(resident?.sex ?? "");
  const [civilStatus, setCivilStatus] = useState(resident?.civilStatus ?? "");
  const [householdId, setHouseholdId] = useState(resident?.householdId ?? "");
  const [isPwd, setIsPwd] = useState(resident?.isPwd ?? false);
  const [createAccount, setCreateAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success(resident ? "Resident updated." : "Resident registered.");
      onSuccess?.();
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Personal Info */}
      <Section title="Personal Information">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First Name"
            name="firstName"
            placeholder="Juan"
            defaultValue={resident?.firstName}
            error={state.fieldErrors?.firstName}
            required
          />
          <Field
            label="Middle Name"
            name="middleName"
            placeholder="Santos"
            defaultValue={resident?.middleName ?? ""}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field
              label="Last Name"
              name="lastName"
              placeholder="Dela Cruz"
              defaultValue={resident?.lastName}
              error={state.fieldErrors?.lastName}
              required
            />
          </div>
          <Field
            label="Suffix"
            name="suffix"
            placeholder="Jr."
            defaultValue={resident?.suffix ?? ""}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Sex"
            name="sex"
            value={sex}
            onValueChange={setSex}
            placeholder="Select..."
            error={state.fieldErrors?.sex}
            required
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
          <Field
            label="Date of Birth"
            name="birthDate"
            type="date"
            defaultValue={resident?.birthDate}
            error={state.fieldErrors?.birthDate}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Birth Place"
            name="birthPlace"
            placeholder="Laoag City"
            defaultValue={resident?.birthPlace ?? ""}
          />
          <SelectField
            label="Civil Status"
            name="civilStatus"
            value={civilStatus}
            onValueChange={setCivilStatus}
            placeholder="Select..."
            error={state.fieldErrors?.civilStatus}
            required
            options={[
              { value: "single", label: "Single" },
              { value: "married", label: "Married" },
              { value: "widowed", label: "Widowed" },
              { value: "separated", label: "Separated" },
              { value: "annulled", label: "Annulled" },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Nationality"
            name="nationality"
            placeholder="Filipino"
            defaultValue={resident?.nationality ?? "Filipino"}
          />
          <Field
            label="Religion"
            name="religion"
            placeholder="Roman Catholic"
            defaultValue={resident?.religion ?? ""}
          />
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact & Household">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Contact Number"
            name="contactNumber"
            type="tel"
            placeholder="09XX XXX XXXX"
            defaultValue={resident?.contactNumber ?? ""}
          />
          <Field
            label="Email Address"
            name="email"
            type="email"
            placeholder="juan@email.com"
            defaultValue={resident?.email ?? ""}
            error={state.fieldErrors?.email}
          />
        </div>
        <Field
          label="Occupation"
          name="occupation"
          placeholder="Farmer, Teacher, etc."
          defaultValue={resident?.occupation ?? ""}
        />
        {households.length > 0 && (
          <SelectField
            label="Household"
            name="householdId"
            value={householdId}
            onValueChange={setHouseholdId}
            placeholder="Select household..."
            options={[
              { value: "none", label: "None" },
              ...households.map((h) => ({
                value: h.id,
                label:
                  `${h.houseNumber ? "#" + h.houseNumber + " " : ""}${h.streetPurok ?? ""}`.trim() ||
                  h.id.slice(0, 8),
              })),
            ]}
          />
        )}
      </Section>

      {/* Special flags */}
      <Section title="Classification">
        <div className="grid grid-cols-2 gap-3">
          <CheckField
            name="isRegisteredVoter"
            label="Registered Voter"
            defaultChecked={resident?.isRegisteredVoter}
          />
          <CheckField
            name="isSeniorCitizen"
            label="Senior Citizen"
            defaultChecked={resident?.isSeniorCitizen}
          />
          <CheckField
            name="isIndigenousPeople"
            label="Indigenous People"
            defaultChecked={resident?.isIndigenousPeople}
          />
          <CheckField
            name="isSoloParent"
            label="Solo Parent"
            defaultChecked={resident?.isSoloParent}
          />
          <div>
            <CheckField
              name="isPwd"
              label="PWD"
              defaultChecked={resident?.isPwd}
              onCheckedChange={(v) => setIsPwd(!!v)}
            />
          </div>
        </div>
        {isPwd && (
          <Field
            label="PWD Type"
            name="pwdType"
            placeholder="e.g. Visual Impairment"
            defaultValue={resident?.pwdType ?? ""}
          />
        )}
        {resident?.isRegisteredVoter && (
          <Field
            label="Voter ID Number"
            name="voterIdNumber"
            placeholder="Voter ID"
            defaultValue={resident?.voterIdNumber ?? ""}
          />
        )}
      </Section>

      {/* Portal account — only on create */}
      {!resident && (
        <Section title="Portal Account">
          <div className="flex items-start gap-3">
            <Checkbox
              id="createPortalAccount"
              name="createPortalAccount"
              value="true"
              checked={createAccount}
              onCheckedChange={(v) => setCreateAccount(!!v)}
              className="mt-0.5"
            />
            <div>
              <Label
                htmlFor="createPortalAccount"
                className="text-sm font-medium cursor-pointer"
              >
                Create resident portal account
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Allows the resident to log in using their phone number.
              </p>
            </div>
          </div>

          {createAccount && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                placeholder="09XX XXX XXXX"
                required
              />
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
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Section>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : resident ? (
          "Save Changes"
        ) : (
          "Register Resident"
        )}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <Separator className="mt-1.5" />
      </div>
      {children}
    </div>
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

function SelectField({
  label,
  name,
  value,
  onValueChange,
  placeholder,
  options,
  error,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select name={name} value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-sm">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function CheckField({
  name,
  label,
  defaultChecked,
  onCheckedChange,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean | null;
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={name}
        name={name}
        value="true"
        defaultChecked={defaultChecked ?? false}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={name} className="text-sm cursor-pointer">
        {label}
      </Label>
    </div>
  );
}
