"use client";

import {
  Receipt,
  TrendingUp,
  FileText,
  Clock,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { AuthUser } from "@/lib/auth";

type TreasuryStats = {
  todayCollections: number;
  weekCollections: number;
  monthCollections: number;
  pendingReceipts: number;
};

function peso(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function TreasuryDashboardClient({
  stats,
  admin,
}: {
  stats: TreasuryStats;
  admin: AuthUser;
}) {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
            Treasury Department
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Good morning, {admin.firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{today}</p>
        </div>
        <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="h-4 w-4" />
          New Collection
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Collections"
          value={peso(stats.todayCollections)}
          icon={<Receipt className="h-4 w-4" />}
          accent="border-t-amber-500"
          iconColor="text-amber-500"
        />
        <StatCard
          label="This Week"
          value={peso(stats.weekCollections)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="border-t-amber-400"
          iconColor="text-amber-400"
        />
        <StatCard
          label="This Month"
          value={peso(stats.monthCollections)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="border-t-amber-300"
          iconColor="text-amber-300"
        />
        <StatCard
          label="Pending Receipts"
          value={String(stats.pendingReceipts)}
          icon={<Clock className="h-4 w-4" />}
          accent="border-t-orange-400"
          iconColor="text-orange-400"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-medium mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Record Collection",
              desc: "Log a new payment",
              icon: Receipt,
              href: "/department-admin/treasury/collections",
            },
            {
              label: "Issue Receipt",
              desc: "Generate official receipt",
              icon: FileText,
              href: "/department-admin/treasury/receipts",
            },
            {
              label: "Daily Report",
              desc: "View today's summary",
              icon: TrendingUp,
              href: "/department-admin/treasury/reports",
            },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="group flex items-start gap-3 rounded-lg border bg-card p-4 hover:border-amber-300 hover:shadow-sm transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                <action.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {action.desc}
                </p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-auto mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>

      {/* Recent collections placeholder */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-medium">Recent Collections</h2>
          <a
            href="/department-admin/treasury/collections"
            className="text-xs text-amber-600 hover:underline"
          >
            View all
          </a>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No collections yet today</p>
          <p className="text-xs text-muted-foreground mt-1">
            Collections recorded today will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  iconColor: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 border-t-2", accent)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className={cn("shrink-0", iconColor)}>{icon}</span>
      </div>
      <p className="text-xl font-semibold tracking-tight truncate">{value}</p>
    </div>
  );
}
