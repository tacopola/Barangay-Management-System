import Link from "next/link"
import { FileText, Shield, User, CalendarCheck } from "lucide-react"

const actions = [
  {
    href: "/resident/documents",
    label: "Request Document",
    sub: "Clearance, ID & more",
    icon: FileText,
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    href: "/resident/blotter",
    label: "File Complaint",
    sub: "Blotter report",
    icon: Shield,
    bg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  {
    href: "/resident/profile",
    label: "My Profile",
    sub: "View & update info",
    icon: User,
    bg: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
  {
    href: "/resident/documents",
    label: "Track Status",
    sub: "Check my requests",
    icon: CalendarCheck,
    bg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
]

export function ResidentQuickActions() {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href + action.label}
              href={action.href}
              className="flex items-center gap-3 p-4 rounded-2xl border bg-card hover:bg-muted/30 active:scale-95 transition-all duration-150 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${action.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {action.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {action.sub}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}