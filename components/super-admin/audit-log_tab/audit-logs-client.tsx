"use client";

import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Database,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";
import { getAuditDiff } from "@/lib/audit-diff";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuditLog = {
  id: string;
  action: string;
  tableName: string;
  recordId: string | null;
  previousValue: unknown;
  newValue: unknown;
  ipAddress: string | null;
  createdAt: Date;
  barangayName: string | null;
  actorName: string | null;
  actorRole: string | null;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 5;

const ACTION_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    badgeClass: string;
  }
> = {
  create: {
    label: "Created",
    icon: <Plus className="h-3 w-3" />,
    badgeClass:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400",
  },
  update: {
    label: "Updated",
    icon: <Pencil className="h-3 w-3" />,
    badgeClass:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400",
  },
  delete: {
    label: "Deleted",
    icon: <Trash2 className="h-3 w-3" />,
    badgeClass:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400",
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DiffView({
  tableName,
  action,
  previousValue,
  newValue,
}: {
  tableName: string;
  action: string;
  previousValue: unknown;
  newValue: unknown;
}) {
  const diff = getAuditDiff(tableName, action, previousValue, newValue);

  if (diff.type === "empty") {
    return (
      <span className="text-xs text-muted-foreground italic">
        No field changes recorded
      </span>
    );
  }

  if (diff.type === "created") {
    return (
      <div className="space-y-1">
        {diff.fields.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground min-w-30">{f.label}</span>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              {f.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (diff.type === "deleted") {
    return (
      <div className="space-y-1">
        {diff.fields.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground min-w-30">{f.label}</span>
            <span className="font-medium text-red-600 line-through dark:text-red-400">
              {f.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // diff.type === "diff"
  return (
    <div className="space-y-1.5">
      {diff.changes.map((c, i) => (
        <div key={i} className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-muted-foreground min-w-25">{c.label}</span>
          <span className="text-red-600 line-through dark:text-red-400">
            {c.before}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-emerald-700 font-medium dark:text-emerald-400">
            {c.after}
          </span>
        </div>
      ))}
    </div>
  );
}

function DiffSummary({
  tableName,
  action,
  previousValue,
  newValue,
}: {
  tableName: string;
  action: string;
  previousValue: unknown;
  newValue: unknown;
}) {
  const diff = getAuditDiff(tableName, action, previousValue, newValue);

  if (diff.type === "empty")
    return <span className="text-xs text-muted-foreground">—</span>;

  if (diff.type === "created") {
    return (
      <span className="text-xs text-muted-foreground">
        {diff.fields.length} field{diff.fields.length !== 1 ? "s" : ""} set
      </span>
    );
  }

  if (diff.type === "deleted") {
    return (
      <span className="text-xs text-muted-foreground">Record removed</span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">
      {diff.changes.length} field{diff.changes.length !== 1 ? "s" : ""} changed
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const config = ACTION_CONFIG[action.toLowerCase()] ?? {
    label: action,
    icon: <Database className="h-3 w-3" />,
    badgeClass: "bg-secondary text-secondary-foreground",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${config.badgeClass}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function LogRow({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Actor */}
        <TableCell>
          <div className="space-y-0.5">
            <div className="font-medium text-sm">
              {log.actorName ?? "System"}
            </div>
            {log.actorRole && (
              <div className="text-xs text-muted-foreground capitalize">
                {log.actorRole.replace(/_/g, " ")}
              </div>
            )}
          </div>
        </TableCell>

        {/* Action */}
        <TableCell>
          <ActionBadge action={log.action} />
        </TableCell>

        {/* Table */}
        <TableCell>
          <div className="flex items-center gap-1.5 text-sm">
            <Database className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="capitalize">
              {log.tableName.replace(/_/g, " ")}
            </span>
          </div>
        </TableCell>

        {/* Summary */}
        <TableCell>
          <DiffSummary
            tableName={log.tableName}
            action={log.action}
            previousValue={log.previousValue}
            newValue={log.newValue}
          />
        </TableCell>

        {/* Barangay */}
        <TableCell className="text-sm">
          {log.barangayName ?? (
            <span className="text-muted-foreground">System</span>
          )}
        </TableCell>

        {/* Date */}
        <TableCell>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground cursor-default">
                {formatDistanceToNow(new Date(log.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {format(new Date(log.createdAt), "PPP p")}
            </TooltipContent>
          </Tooltip>
        </TableCell>

        {/* Expand toggle */}
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
      </TableRow>

      {open && (
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={7} className="py-3 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Changes */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Changes
                </p>
                <DiffView
                  tableName={log.tableName}
                  action={log.action}
                  previousValue={log.previousValue}
                  newValue={log.newValue}
                />
              </div>

              {/* Metadata */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Details
                </p>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                  {log.recordId && (
                    <>
                      <span className="text-muted-foreground">Record ID</span>
                      <span className="font-mono truncate">{log.recordId}</span>
                    </>
                  )}
                  {log.ipAddress && (
                    <>
                      <span className="text-muted-foreground">IP Address</span>
                      <span className="font-mono">{log.ipAddress}</span>
                    </>
                  )}
                  <span className="text-muted-foreground">Timestamp</span>
                  <span>{format(new Date(log.createdAt), "PPP p")}</span>
                  <span className="text-muted-foreground">Log ID</span>
                  <span className="font-mono truncate text-muted-foreground">
                    {log.id}
                  </span>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AuditLogsClient({ logs }: { logs: AuditLog[] }) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Unique table names for filter dropdown
  const tableNames = useMemo(
    () => ["all", ...Array.from(new Set(logs.map((l) => l.tableName))).sort()],
    [logs],
  );

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase().trim();

      const matchesSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.tableName.toLowerCase().includes(q) ||
        log.actorName?.toLowerCase().includes(q) ||
        log.barangayName?.toLowerCase().includes(q) ||
        log.recordId?.toLowerCase().includes(q);

      const matchesAction =
        actionFilter === "all" || log.action.toLowerCase() === actionFilter;

      const matchesTable =
        tableFilter === "all" || log.tableName === tableFilter;

      return matchesSearch && matchesAction && matchesTable;
    });
  }, [logs, search, actionFilter, tableFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = search || actionFilter !== "all" || tableFilter !== "all";

  function clearFilters() {
    setSearch("");
    setActionFilter("all");
    setTableFilter("all");
    setPage(1);
  }

  // Reset page when filters change
  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }
  function handleActionFilter(v: string) {
    setActionFilter(v);
    setPage(1);
  }
  function handleTableFilter(v: string) {
    setTableFilter(v);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-50">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by actor, table, barangay..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={actionFilter} onValueChange={handleActionFilter}>
                <SelectTrigger className="w-32.5">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Created</SelectItem>
                  <SelectItem value="update">Updated</SelectItem>
                  <SelectItem value="delete">Deleted</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tableFilter} onValueChange={handleTableFilter}>
                <SelectTrigger className="w-37.5">
                  <SelectValue placeholder="Table" />
                </SelectTrigger>
                <SelectContent>
                  {tableNames.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "all" ? "All Tables" : t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <span className="text-xs text-muted-foreground ml-auto">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Barangay</TableHead>
                <TableHead>When</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No audit logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
