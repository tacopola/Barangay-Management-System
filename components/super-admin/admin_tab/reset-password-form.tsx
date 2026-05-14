"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { resetAdminPasswordAction } from "@/actions/admin"

export function ResetPasswordForm({
  authId,
  onSuccess,
}: {
  authId: string
  onSuccess?: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const form = e.currentTarget
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    startTransition(async () => {
      const res = await resetAdminPasswordAction(authId, password)
      if (res.error) setError(res.error)
      else onSuccess?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PasswordField
        id="password"
        label="New Password"
        show={showPassword}
        onToggle={() => setShowPassword(!showPassword)}
      />

      <PasswordField
        id="confirm"
        label="Confirm Password"
        show={showConfirm}
        onToggle={() => setShowConfirm(!showConfirm)}
      />

      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </div>
    </form>
  )
}

function PasswordField({
  id, label, show, onToggle,
}: {
  id: string
  label: string
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          placeholder="Min. 8 characters"
          className="h-9 text-sm pr-10"
          required
          minLength={8}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          tabIndex={-1}
          className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
          onClick={onToggle}
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  )
}