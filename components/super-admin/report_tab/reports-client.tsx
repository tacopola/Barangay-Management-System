"use client"

import {
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { Users, FileText, Shield, Heart } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { TooltipProps } from "recharts"



// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
type TooltipPayloadItem = {
  color?: string
  name?: string
  value?: number
}

type CustomTooltipProps = {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

const DOC_TYPE_LABELS: Record<string, string> = {
  barangay_clearance:        "Clearance",
  certificate_of_residency:  "Residency",
  certificate_of_indigency:  "Indigency",
  barangay_id:               "Barangay ID",
  business_clearance:        "Business",
  good_moral_certificate:    "Good Moral",
}

const BLOTTER_STATUS_LABELS: Record<string, string> = {
  filed:           "Filed",
  under_mediation: "Mediation",
  settled:         "Settled",
  escalated:       "Escalated",
  dismissed:       "Dismissed",
}

const PROGRAM_TYPE_LABELS: Record<string, string> = {
  "4ps":          "4Ps",
  senior_citizen: "Senior Citizen",
  pwd:            "PWD",
  solo_parent:    "Solo Parent",
  indigent:       "Indigent",
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "#52b788",
  "#f4a261",
  "#457b9d",
  "#e76f51",
  "#2d6a4f",
]

const CHART_COLORS = {
  primary:   "hsl(var(--primary))",
  emerald:   "#52b788",
  amber:     "#f4a261",
  blue:      "#457b9d",
  red:       "#e76f51",
  muted:     "hsl(var(--muted-foreground))",
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReportsData = {
  barangayStats: {
    name: string
    residents: number
    totalDocs: number
    pendingDocs: number
    totalBlotter: number
    activeBlotter: number
    beneficiaries: number
  }[]
  docTypeBreakdown: { docType: string; count: number }[]
  blotterStatusBreakdown: { status: string; count: number }[]
  programBreakdown: { type: string | null; count: number }[]
  monthlyDocs: { month: string; count: number }[]
  totals: {
    totalResidents: number
    totalDocs: number
    totalBlotter: number
    totalBeneficiaries: number
  }
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card shadow-md px-3 py-2 text-xs">
      {label && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ReportsClient({ data }: { data: ReportsData }) {
  const { barangayStats, docTypeBreakdown, blotterStatusBreakdown,
          programBreakdown, monthlyDocs, totals } = data

  const docPieData = docTypeBreakdown.map((d) => ({
    name: DOC_TYPE_LABELS[d.docType] ?? d.docType,
    value: d.count,
  }))

  const blotterPieData = blotterStatusBreakdown.map((b) => ({
    name: BLOTTER_STATUS_LABELS[b.status] ?? b.status,
    value: b.count,
  }))

  const programPieData = programBreakdown
    .filter((p) => p.type)
    .map((p) => ({
      name: PROGRAM_TYPE_LABELS[p.type!] ?? p.type,
      value: p.count,
    }))

  return (
    <div className="space-y-6">

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={<Users className="h-4 w-4 text-blue-500" />} label="Total Residents" value={totals.totalResidents} accent="border-t-blue-500" />
        <SummaryCard icon={<FileText className="h-4 w-4 text-primary" />} label="Doc Requests" value={totals.totalDocs} accent="border-t-primary" />
        <SummaryCard icon={<Shield className="h-4 w-4 text-red-500" />} label="Blotter Cases" value={totals.totalBlotter} accent="border-t-red-500" />
        <SummaryCard icon={<Heart className="h-4 w-4 text-emerald-500" />} label="Beneficiaries" value={totals.totalBeneficiaries} accent="border-t-emerald-500" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-9 mb-6">
          <TabsTrigger value="overview" className="text-xs px-4">Overview</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs px-4">Documents</TabsTrigger>
          <TabsTrigger value="blotter" className="text-xs px-4">Blotter</TabsTrigger>
          <TabsTrigger value="programs" className="text-xs px-4">Programs</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB ── */}
        <TabsContent value="overview" className="space-y-6">

          {/* Monthly doc requests trend */}
          <ChartCard
            title="Document Requests — Last 6 Months"
            subtitle="Monthly volume of document requests across all barangays"
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyDocs} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="docGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Requests"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#docGradient)"
                  dot={{ fill: CHART_COLORS.primary, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Residents per barangay */}
          <ChartCard
            title="Residents per Barangay"
            subtitle="Total registered residents per barangay"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barangayStats}
                margin={{ top: 8, right: 8, left: -20, bottom: 40 }}
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  angle={-35}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="residents" name="Residents" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Barangay comparison table */}
          <ChartCard
            title="Barangay Comparison"
            subtitle="Side-by-side stats for all barangays"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Barangay</th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Residents</th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Doc Requests</th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">Pending</th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:table-cell">Blotter</th>
                    <th className="text-right py-2.5 px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium hidden md:table-cell">Beneficiaries</th>
                  </tr>
                </thead>
                <tbody>
                  {barangayStats.map((b) => (
                    <tr key={b.name} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-medium">{b.name}</td>
                      <td className="py-3 px-3 text-right tabular-nums">{b.residents.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right tabular-nums">{b.totalDocs.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right tabular-nums hidden sm:table-cell">
                        <span className={b.pendingDocs > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                          {b.pendingDocs}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums hidden sm:table-cell">
                        <span className={b.activeBlotter > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                          {b.totalBlotter}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums hidden md:table-cell">{b.beneficiaries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </TabsContent>

        {/* ── DOCUMENTS TAB ── */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Doc type pie */}
            <ChartCard
              title="Requests by Document Type"
              subtitle="Distribution across all document types"
            >
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={docPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {docPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Doc requests per barangay bar */}
            <ChartCard
              title="Requests per Barangay"
              subtitle="Total vs pending document requests"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={barangayStats}
                  margin={{ top: 8, right: 8, left: -20, bottom: 40 }}
                  barSize={12}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    angle={-35}
                    textAnchor="end"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                  <Bar dataKey="totalDocs" name="Total" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pendingDocs" name="Pending" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* ── BLOTTER TAB ── */}
        <TabsContent value="blotter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Blotter status pie */}
            <ChartCard
              title="Cases by Status"
              subtitle="Distribution of blotter cases by current status"
            >
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={blotterPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {blotterPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Blotter per barangay */}
            <ChartCard
              title="Cases per Barangay"
              subtitle="Total vs active blotter cases"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={barangayStats}
                  margin={{ top: 8, right: 8, left: -20, bottom: 40 }}
                  barSize={12}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    angle={-35}
                    textAnchor="end"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                  <Bar dataKey="totalBlotter" name="Total" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="activeBlotter" name="Active" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* ── PROGRAMS TAB ── */}
        <TabsContent value="programs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Program type pie */}
            <ChartCard
              title="Beneficiaries by Program Type"
              subtitle="Distribution of beneficiaries across program types"
            >
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={programPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {programPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Beneficiaries per barangay */}
            <ChartCard
              title="Beneficiaries per Barangay"
              subtitle="Total enrolled beneficiaries per barangay"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={barangayStats}
                  margin={{ top: 8, right: 8, left: -20, bottom: 40 }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    angle={-35}
                    textAnchor="end"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="beneficiaries" name="Beneficiaries" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({
  icon, label, value, accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent: string
}) {
  return (
    <div className={`rounded-xl border bg-card p-5 border-t-2 ${accent}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        {icon}
      </div>
      <p className="text-3xl font-light tracking-tight">{value.toLocaleString()}</p>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
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
  )
}