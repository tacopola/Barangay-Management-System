"use client";

import Link from "next/link";
import { Bell, Building } from "lucide-react";
import type { AuthUser } from "@/lib/auth";
import { LogoutButton } from "../auth/logout-resident-button";
export function ResidentTopBar({ user }: { user: AuthUser }) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b px-5 py-3.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Building className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-bold tracking-tight">
          Barangay Portal
        </span>
      </div>
      <LogoutButton />

      <Link
        href="/resident/notifications"
        className="relative w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
      >
        <Bell className="h-4.5 w-4.5 text-muted-foreground" />
        {/* wire to real unread count later */}
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
      </Link>
    </header>
  );
}
