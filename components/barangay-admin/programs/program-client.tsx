"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PROGRAM_TYPES, PROGRAM_TYPE_COLORS } from "./program-type-colors";
import { Search, Users, ArrowRight,  UserCheck, Speech } from "lucide-react";
import { cn } from "@/lib/utils";

type Program = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  activeBeneficiaryCount: number;
};

function getProgramTypeLabel(type: string) {
  return PROGRAM_TYPES.find((t) => t.value === type)?.label ?? type;
}

type ProgramsClientProps = {
  programs: Program[];
};

export function ProgramsClient({ programs }: ProgramsClientProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = programs.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      getProgramTypeLabel(p.type).toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && p.isActive) ||
      (filter === "inactive" && !p.isActive);
    return matchesSearch && matchesFilter;
  });

  const activeCount = programs.filter((p) => p.isActive).length;
  const totalBeneficiaries = programs.reduce(
    (s, p) => s + p.activeBeneficiaryCount,
    0,
  );

  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Speech className="h-4 w-4 text-primary" />}
          label="Total Programs"
          value={String(programs.length)}
          accent="border-t-primary"
        />
        <StatCard
          icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
          label="Active Programs"
          value={String(activeCount)}
          accent="border-t-emerald-500"
        />
        <StatCard
          icon={<Users className="h-4 w-4 text-blue-600" />}
          label="Total Beneficiaries"
          value={String(totalBeneficiaries)}
          accent="border-t-blue-500"
        />
        accent="border-t-blue-500"
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center rounded-md border bg-muted/40 p-0.5 gap-0.5">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded text-xs font-medium capitalize transition-colors",
                filter === f
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Programs grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No programs found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search
              ? "Try a different search term."
              : "No programs have been assigned to your barangay yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((program) => (
            <div
              key={program.id}
              className={cn(
                "rounded-lg border bg-card p-5 flex flex-col gap-3 transition-shadow hover:shadow-sm",
                !program.isActive && "opacity-60",
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-sm leading-snug truncate">
                    {program.name}
                  </h3>
                  <span
                    className={cn(
                      "inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full border",
                      PROGRAM_TYPE_COLORS[program.type] ??
                        PROGRAM_TYPE_COLORS.other,
                    )}
                  >
                    {getProgramTypeLabel(program.type)}
                  </span>
                </div>
                <Badge
                  variant={program.isActive ? "default" : "secondary"}
                  className="text-[10px] shrink-0"
                >
                  {program.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Description */}
              {program.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {program.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {program.activeBeneficiaryCount}{" "}
                    {program.activeBeneficiaryCount === 1
                      ? "beneficiary"
                      : "beneficiaries"}
                  </span>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                >
                  <Link href={`/admin/programs/${program.id}`}>
                    Manage
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl border bg-card p-4 border-t-2 ${accent}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        {icon}
      </div>
      <p className="text-3xl font-light">{value}</p>
    </div>
  );
}
