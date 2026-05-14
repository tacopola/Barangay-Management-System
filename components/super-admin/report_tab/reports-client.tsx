"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Users,
  Building2,
  Megaphone,
  FolderKanban,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Overview = {
  residents: number;
  barangays: number;
  announcements: number;
  programs: number;
};

type ResidentStat = {
  barangay: string;
  residents: number;
};

export function ReportsClient({
  overview,
  residentStats,
}: {
  overview: Overview;
  residentStats: ResidentStat[];
}) {
  const pieData = residentStats.map((item) => ({
    name: item.barangay,
    value: item.residents,
  }));

  return (
    <div className="space-y-6">
      {/* Overview */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Residents"
          value={overview.residents}
          icon={<Users className="h-4 w-4" />}
        />

        <StatCard
          title="Barangays"
          value={overview.barangays}
          icon={<Building2 className="h-4 w-4" />}
        />

        <StatCard
          title="Announcements"
          value={overview.announcements}
          icon={<Megaphone className="h-4 w-4" />}
        />

        <StatCard
          title="Programs"
          value={overview.programs}
          icon={<FolderKanban className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Bar Chart */}

        <Card>
          <CardHeader>
            <CardTitle>
              Residents by Barangay
            </CardTitle>
          </CardHeader>

          <CardContent className="h-87.5">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={residentStats}>
                <XAxis dataKey="barangay" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="residents" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}

        <Card>
          <CardHeader>
            <CardTitle>
              Population Distribution
            </CardTitle>
          </CardHeader>

          <CardContent className="h-87.5">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}

      <Card>
        <CardHeader>
          <CardTitle>
            Residents Per Barangay
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Barangay
                </TableHead>

                <TableHead className="text-right">
                  Total Residents
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {residentStats.map((item) => (
                <TableRow key={item.barangay}>
                  <TableCell className="font-medium">
                    {item.barangay}
                  </TableCell>

                  <TableCell className="text-right">
                    {item.residents}
                  </TableCell>
                </TableRow>
              ))}

              {residentStats.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground"
                  >
                    No data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h2 className="text-2xl font-semibold">
            {value.toLocaleString()}
          </h2>
        </div>

        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}