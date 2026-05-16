"use client";

import { Button } from "@/components/ui/button";
import { logoutAdminAction } from "@/actions/auth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={logoutAdminAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground w-full justify-start gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </form>
  );
}
