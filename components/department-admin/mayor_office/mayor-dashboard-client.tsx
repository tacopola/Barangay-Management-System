"use client";

import {
  FolderOpen,
  Mail,
  Calendar,
  Megaphone,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { AuthUser } from "@/lib/auth";

type MayorStats = {
  pendingDocuments: number;
  todayAppointments: number;
  unreadCorrespondence: number;
  activeAnnouncements: number;
};

export function MayorDashboardClient({
  stats,
  admin,
}: {
  stats: MayorStats;
  admin: AuthUser;
}) {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
            Mayor's Office
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Good morning, {admin.firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{today}</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Documents"
          value={String(stats.pendingDocuments)}
          icon={<FolderOpen className="h-4 w-4" />}
          accent="border-t-blue-600"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Today's Appointments"
          value={String(stats.todayAppointments)}
          icon={<Calendar className="h-4 w-4" />}
          accent="border-t-blue-400"
          iconColor="text-blue-400"
        />
        <StatCard
          label="Unread Correspondence"
          value={String(stats.unreadCorrespondence)}
          icon={<Mail className="h-4 w-4" />}
          accent="border-t-sky-500"
          iconColor="text-sky-500"
        />
        <StatCard
          label="Active Announcements"
          value={String(stats.activeAnnouncements)}
          icon={<Megaphone className="h-4 w-4" />}
          accent="border-t-sky-400"
          iconColor="text-sky-400"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-medium mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Route Document",
              desc: "Log incoming/outgoing",
              icon: FolderOpen,
              href: "/department-admin/mayor_office/documents",
            },
            {
              label: "Correspondence",
              desc: "Track letters & memos",
              icon: Mail,
              href: "/department-admin/mayor_office/correspondence",
            },
            {
              label: "Appointments",
              desc: "Manage schedule",
              icon: Calendar,
              href: "/department-admin/mayor_office/appointments",
            },
            {
              label: "Post Announcement",
              desc: "Publish from mayor",
              icon: Megaphone,
              href: "/department-admin/mayor_office/announcements",
            },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="group flex items-start gap-3 rounded-lg border bg-card p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
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

      {/* Today's appointments placeholder */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-medium">Today's Appointments</h2>
          <a
            href="/department-admin/mayor_office/appointments"
            className="text-xs text-blue-600 hover:underline"
          >
            View all
          </a>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No appointments today</p>
          <p className="text-xs text-muted-foreground mt-1">
            Scheduled appointments will appear here.
          </p>
        </div>
      </div>

      {/* Recent documents placeholder */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-medium">Pending Documents</h2>
          <a
            href="/department-admin/mayor_office/documents"
            className="text-xs text-blue-600 hover:underline"
          >
            View all
          </a>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No pending documents</p>
          <p className="text-xs text-muted-foreground mt-1">
            Documents awaiting action will appear here.
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
      <p className="text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
