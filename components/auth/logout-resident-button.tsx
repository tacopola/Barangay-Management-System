"use client";

import { useFormStatus } from "react-dom";
import { Loader2, LogOut } from "lucide-react";

import { logoutResidentAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      disabled={pending}
      className="
        h-12
        w-full
        justify-start
        gap-3
        rounded-xl
        px-4
        text-sm
        font-medium
        transition-colors
        hover:bg-red-50
        hover:text-red-600
        dark:hover:bg-red-950/20
        dark:hover:text-red-400
      "
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}

      <span>{pending ? "Signing out..." : "Sign out"}</span>
    </Button>
  );
}

export function LogoutButton() {
  return (
    <form action={logoutResidentAction} className="p-2">
      <SubmitButton />
    </form>
  );
}
