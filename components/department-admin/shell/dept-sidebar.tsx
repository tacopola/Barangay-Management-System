"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  LayoutDashboard,
  Receipt,
  FileText,
  BarChart3,
  ClipboardList,
  Users,
  Calendar,
  Mail,
  Megaphone,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Receipt,
  FileText,
  BarChart3,
  ClipboardList,
  Users,
  Calendar,
  Mail,
  Megaphone,
  FolderOpen,
};

type SerializedNavItem = {
  label: string;
  href: string;
  iconName: string;
};

type DeptSidebarProps = {
  deptLabel: string;
  deptDescription: string;
  accentColor: string;
  accentText: string;
  navItems: SerializedNavItem[];
  adminName: string;
};

export function DeptSidebar({
  deptLabel,
  deptDescription,
  accentColor,
  accentText,
  navItems,
  adminName,
}: DeptSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/admin-login");
  }

  const basePath = "/" + pathname.split("/").slice(1, 3).join("/");

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-white border-r transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b",
          collapsed && "justify-center px-3",
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            accentColor,
          )}
        >
          <Building2 className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-tight truncate">
              {deptLabel}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">
              {deptDescription}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.iconName] ?? FileText;
          const isDashboard = item.href === basePath;
          const isActive = isDashboard
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", isActive && accentText)}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-2 py-3 space-y-0.5">
        {/* User info */}
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate">{adminName}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {deptLabel}
            </p>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors",
            collapsed && "justify-center px-2",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronLeft className="h-4 w-4 shrink-0" />
          )}
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
