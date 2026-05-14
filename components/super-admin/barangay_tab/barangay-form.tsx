"use client"

import { useActionState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { createBarangayAction, updateBarangayAction } from "@/actions/barangay"
import { toast } from "sonner"

type Barangay = {
  id: string
  name: string
  municipality: string
  province: string
  region: string
  zipCode: string | null
  contactNumber: string | null
  email: string | null
}

export function BarangayForm({
  barangay,
  onSuccess,
}: {
  barangay?: Barangay | null
  onSuccess?: () => void
}) {
  const action = barangay
    ? updateBarangayAction.bind(null, barangay.id)
    : createBarangayAction

  const [state, formAction, isPending] = useActionState(action, {})

  useEffect(() => {
    if (state.success) {
      toast.success(barangay ? "Barangay updated." : "Barangay registered.")
      onSuccess?.()
    }
  }, [state.success])

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Field
        label="Barangay Name"
        name="name"
        placeholder="e.g. Brgy. San Lorenzo"
        defaultValue={barangay?.name}
        error={state.fieldErrors?.name}
        required
      />

      <Field
        label="Municipality"
        name="municipality"
        placeholder="e.g. Laoag City"
        defaultValue={barangay?.municipality}
        error={state.fieldErrors?.municipality}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Province"
          name="province"
          placeholder="e.g. Ilocos Norte"
          defaultValue={barangay?.province}
          error={state.fieldErrors?.province}
          required
        />
        <Field
          label="Region"
          name="region"
          placeholder="e.g. Region I"
          defaultValue={barangay?.region}
          error={state.fieldErrors?.region}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="ZIP Code"
          name="zipCode"
          placeholder="e.g. 2900"
          defaultValue={barangay?.zipCode ?? ""}
        />
        <Field
          label="Contact Number"
          name="contactNumber"
          placeholder="e.g. 09XX XXX XXXX"
          defaultValue={barangay?.contactNumber ?? ""}
        />
      </div>

      <Field
        label="Email Address"
        name="email"
        type="email"
        placeholder="e.g. brgy@laoag.gov.ph"
        defaultValue={barangay?.email ?? ""}
        error={state.fieldErrors?.email}
      />

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : barangay ? (
            "Save Changes"
          ) : (
            "Register Barangay"
          )}
        </Button>
      </div>
    </form>
  )
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
  label: string
  name: string
  placeholder?: string
  defaultValue?: string
  error?: string
  type?: string
  required?: boolean
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
  )
}