"use client"

import { Button } from "@/components/ui/button"
import { logoutResidentAction } from "@/actions/auth"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <form action={logoutResidentAction}>
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        className="w-full h-10 justify-center gap-2"
      >
        <LogOut/>
        Sign out
      </Button>
    </form>
  )
}