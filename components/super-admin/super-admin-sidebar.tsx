"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-admin-button";
import type { AuthUser } from "@/lib/auth";
import {
  LayoutDashboard,
  Building2,
  Users,
  Megaphone,
  BarChart3,
  ScrollText,
  Boxes,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

type NavSection = {
  label: string;
  group: string | null;
  items: NavItem[];
};

const navItems: NavSection[] = [
  {
    label: "Overview",
    group: null,
    items: [
      {
        href: "/super-admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      { href: "/super-admin/barangays", label: "Barangays", icon: Building2 },
    ],
  },
  {
    label: "Management",
    group: "management",
    items: [
      { href: "/super-admin/admins", label: "Admins", icon: Users },
      { href: "/super-admin/programs", label: "Programs", icon: Boxes },
      {
        href: "/super-admin/announcements",
        label: "Announcements",
        icon: Megaphone,
      },
    ],
  },
  {
    label: "Monitoring",
    group: "monitoring",
    items: [
      { href: "/super-admin/reports", label: "Reports", icon: BarChart3 },
      {
        href: "/super-admin/audit-logs",
        label: "Audit Logs",
        icon: ScrollText,
      },
    ],
  },
];

export function SuperAdminSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <aside className="w-56 shrink-0 border-r bg-card flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Municipality Portal
        </p>
        <p className="text-sm font-semibold leading-tight">BMS Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navItems.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-1">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t px-2 py-3 space-y-1">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] text-muted-foreground">Super Admin</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
