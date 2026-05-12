"use client"

import { Users, Home, FileText, Shield } from "lucide-react"

type Stats = {
  totalResidents: number
  totalHouseholds: number
  pendingDocs: number
  activeBlotters: number
}

const cards = [
  {
    key: "totalResidents" as const,
    label: "Residents",
    icon: Users,
    accent: "border-t-blue-500",
    iconColor: "text-blue-500",
  },
  {
    key: "totalHouseholds" as const,
    label: "Households",
    icon: Home,
    accent: "border-t-amber-500",
    iconColor: "text-amber-500",
  },
  {
    key: "pendingDocs" as const,
    label: "Pending Requests",
    icon: FileText,
    accent: "border-t-emerald-500",
    iconColor: "text-emerald-500",
  },
  {
    key: "activeBlotters" as const,
    label: "Active Blotters",
    icon: Shield,
    accent: "border-t-red-500",
    iconColor: "text-red-500",
  },
]

export function AdminStatCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.key}
            className={`rounded-xl border bg-card p-5 border-t-2 ${card.accent}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {card.label}
              </p>
              <Icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
            <p className="text-3xl font-light tracking-tight">
              {stats[card.key].toLocaleString()}
            </p>
          </div>
        )
      })}
    </div>
  )
}