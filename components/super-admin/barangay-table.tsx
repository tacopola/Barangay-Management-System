"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus } from "lucide-react"

type Barangay = {
  id: string
  name: string
  municipality: string
  isActive: boolean
  contactNumber: string | null
  email: string | null
}

export function BarangayTable({ barangays }: { barangays: Barangay[] }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")

  const filtered = barangays.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === "all" ||
      (filter === "active" && b.isActive) ||
      (filter === "inactive" && !b.isActive)
    return matchSearch && matchFilter
  })

  return (
    <div className="rounded-xl border bg-card overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h2 className="text-sm font-semibold">Barangay Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            All registered barangays under this municipality
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs h-8">
            Export
          </Button>
          <Button size="sm" className="text-xs h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Barangay
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between px-5 py-3 border-b gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-3">All ({barangays.length}) </TabsTrigger>
            <TabsTrigger value="active" className="text-xs px-3">Active</TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs px-3">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search barangay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Barangay</th>
            <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Contact</th>
            <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Email</th>
            <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Status</th>
            <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                No barangays found
              </td>
            </tr>
          ) : (
            filtered.map((b) => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3 text-sm font-medium">{b.name}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{b.contactNumber ?? "—"}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{b.email ?? "—"}</td>
                <td className="px-5 py-3">
                  <Badge variant={b.isActive ? "default" : "secondary"} className="text-[10px]">
                    {b.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-start">
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    View
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

    </div>
  )
}