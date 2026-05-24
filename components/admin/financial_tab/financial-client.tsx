"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { deleteFinancialRecordAction } from "@/actions/admin/financial";
import { FinancialForm } from "./financial-form";
import { toast } from "sonner";


type FinancialRecord = {
  id: string;
  type: string;
  amount: string;
  category: string;
  description: string | null;
  referenceNumber: string | null;
  transactionDate: string;
  fiscalYear: number;
  quarter: number | null;
  createdAt: Date;
  recordedByFirstName: string | null;
  recordedByLastName: string | null;
};

type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  quarters: { quarter: number; income: number; expense: number }[];
  categories: { category: string; income: number; expense: number }[];
  fiscalYear: number;
};

type TooltipPayload = {
  color?: string;
  name?: string;
  value?: number;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};


const INCOME_CATEGORIES = [
  "IRA (Internal Revenue Allotment)",
  "Local Taxes",
  "Business Permits",
  "Fines & Penalties",
  "Grants & Donations",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Personnel Services",
  "Maintenance & Operations",
  "Capital Outlay",
  "Infrastructure",
  "Social Services",
  "Peace & Order",
  "Environmental",
  "Administrative",
  "Other Expenses",
];

const PIE_COLORS = [
  "hsl(var(--primary))",
  "#52b788",
  "#f4a261",
  "#457b9d",
  "#e76f51",
  "#9b72cf",
  "#e07a9f",
];

const QUARTER_LABELS = [
  "Q1 (Jan-Mar)",
  "Q2 (Apr-Jun)",
  "Q3 (Jul-Sep)",
  "Q4 (Oct-Dec)",
];


function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card shadow-md px-3 py-2 text-xs">
      {label && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatCurrency(Number(p.value))}
        </p>
      ))}
    </div>
  );
}


export function FinancialsClient({
  records,
  summary,
  availableYears,
  currentYear,
}: {
  records: FinancialRecord[];
  summary: Summary;
  availableYears: number[];
  currentYear: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FinancialRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinancialRecord | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const filtered = records.filter((r) => {
    const matchSearch =
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.referenceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteFinancialRecordAction(deleteTarget.id);
      if (res.error) toast.error(res.error);
      else toast.success("Record deleted.");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function handleYearChange(year: string) {
    router.push(`${pathname}?year=${year}`);
  }

  // Chart data
  const quarterData = summary.quarters.map((q) => ({
    name: `Q${q.quarter}`,
    Income: q.income,
    Expense: q.expense,
  }));

  const incomePieData = summary.categories
    .filter((c) => c.income > 0)
    .map((c) => ({ name: c.category, value: c.income }));

  const expensePieData = summary.categories
    .filter((c) => c.expense > 0)
    .map((c) => ({ name: c.category, value: c.expense }));

  return (
    <div className="space-y-6">
      {/* Year selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Fiscal Year:</p>
          <Select value={String(currentYear)} onValueChange={handleYearChange}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)} className="text-xs">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="text-xs h-8 gap-1.5" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />
          Add Record
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 border-t-2 border-t-emerald-500">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Income
            </p>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-light text-emerald-700">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 border-t-2 border-t-red-500">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Total Expenses
            </p>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-2xl font-light text-red-700">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
        <div
          className={`rounded-xl border bg-card p-5 border-t-2 ${summary.balance >= 0 ? "border-t-primary" : "border-t-destructive"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Balance
            </p>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <p
            className={`text-2xl font-light ${summary.balance >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="records">
        <TabsList className="h-9 mb-4">
          <TabsTrigger value="records" className="text-xs px-4">
            Records
          </TabsTrigger>
          <TabsTrigger value="charts" className="text-xs px-4">
            Charts
          </TabsTrigger>
        </TabsList>

        {/* ── RECORDS TAB ── */}
        <TabsContent value="records">
          <div className="rounded-xl border bg-card overflow-hidden">
            {/* Filters */}
            <div className="flex items-center gap-3 px-5 py-3 border-b flex-wrap">
              <Tabs
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
              >
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-3">
                    All ({records.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="income"
                    className="text-xs px-3 text-emerald-700"
                  >
                    Income ({records.filter((r) => r.type === "income").length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="expense"
                    className="text-xs px-3 text-red-700"
                  >
                    Expense (
                    {records.filter((r) => r.type === "expense").length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative ml-auto w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search category, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Date
                    </th>
                    <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Category
                    </th>
                    <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">
                      Description
                    </th>
                    <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">
                      Ref No.
                    </th>
                    <th className="text-right px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Amount
                    </th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-16 text-sm text-muted-foreground"
                      >
                        <Wallet className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No financial records found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-sm">
                            {new Date(r.transactionDate).toLocaleDateString(
                              "en-PH",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                          {r.quarter && (
                            <p className="text-[10px] text-muted-foreground">
                              Q{r.quarter}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {r.type === "income" ? (
                              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <ArrowDownRight className="h-3.5 w-3.5 text-red-600 shrink-0" />
                            )}
                            <p className="text-sm font-medium">{r.category}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {r.description ?? "—"}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <p className="text-xs font-mono text-muted-foreground">
                            {r.referenceNumber ?? "—"}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <p
                            className={`text-sm font-semibold tabular-nums ${r.type === "income" ? "text-emerald-700" : "text-red-700"}`}
                          >
                            {r.type === "expense" ? "−" : "+"}
                            {formatCurrency(parseFloat(r.amount))}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="text-sm"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditTarget(r);
                                  setDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(r)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filtered.length > 0 && (
                  <tfoot>
                    <tr className="border-t bg-muted/20">
                      <td
                        colSpan={4}
                        className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {typeFilter === "all"
                          ? "Net Balance"
                          : typeFilter === "income"
                            ? "Total Income"
                            : "Total Expenses"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <p
                          className={`text-sm font-bold tabular-nums ${
                            typeFilter === "expense"
                              ? "text-red-700"
                              : typeFilter === "income"
                                ? "text-emerald-700"
                                : summary.balance >= 0
                                  ? "text-emerald-700"
                                  : "text-red-700"
                          }`}
                        >
                          {typeFilter === "income"
                            ? formatCurrency(summary.totalIncome)
                            : typeFilter === "expense"
                              ? formatCurrency(summary.totalExpense)
                              : formatCurrency(summary.balance)}
                        </p>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── CHARTS TAB ── */}
        <TabsContent value="charts" className="space-y-6">
          {/* Quarterly bar chart */}
          <ChartCard
            title="Quarterly Overview"
            subtitle={`Income vs Expenses per quarter — FY ${currentYear}`}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={quarterData}
                margin={{ top: 8, right: 8, left: 10, bottom: 0 }}
                barSize={20}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
                />
                <Bar dataKey="Income" fill="#52b788" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#e76f51" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income breakdown pie */}
            <ChartCard title="Income Sources" subtitle="Breakdown by category">
              {incomePieData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                  No income records
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={incomePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {incomePieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(v) => (
                        <span style={{ fontSize: 10 }}>{v}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Expense breakdown pie */}
            <ChartCard
              title="Expense Breakdown"
              subtitle="Breakdown by category"
            >
              {expensePieData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                  No expense records
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expensePieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(v) => (
                        <span style={{ fontSize: 10 }}>{v}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Category summary table */}
          <ChartCard
            title="Category Summary"
            subtitle="Income and expense totals per category"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Category
                    </th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Income
                    </th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Expense
                    </th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Net
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.categories.map((c) => (
                    <tr
                      key={c.category}
                      className="border-b last:border-0 hover:bg-muted/20"
                    >
                      <td className="py-3 px-3 font-medium">{c.category}</td>
                      <td className="py-3 px-3 text-right text-emerald-700 tabular-nums">
                        {c.income > 0 ? formatCurrency(c.income) : "—"}
                      </td>
                      <td className="py-3 px-3 text-right text-red-700 tabular-nums">
                        {c.expense > 0 ? formatCurrency(c.expense) : "—"}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-semibold tabular-nums ${c.income - c.expense >= 0 ? "text-emerald-700" : "text-red-700"}`}
                      >
                        {formatCurrency(c.income - c.expense)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">
              {editTarget ? "Edit Record" : "Add Financial Record"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update this financial record."
                : "Record a new income or expense."}
            </DialogDescription>
          </DialogHeader>
          <FinancialForm
            record={editTarget}
            currentYear={currentYear}
            incomeCategories={INCOME_CATEGORIES}
            expenseCategories={EXPENSE_CATEGORIES}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="p-8">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {deleteTarget?.type} record of{" "}
              {deleteTarget
                ? formatCurrency(parseFloat(deleteTarget.amount))
                : ""}{" "}
              for {deleteTarget?.category}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
