"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, FileText, Shield, User } from "lucide-react"

const navItems = [
  { href: "/resident", label: "Home", icon: Home, exact: true },
  { href: "/resident/documents", label: "Documents", icon: FileText },
  { href: "/resident/blotter", label: "Blotter", icon: Shield },
  { href: "/resident/profile", label: "Profile", icon: User },
]

export function ResidentBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-background/95 backdrop-blur-md border-t">
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-16 transition-colors"
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all",
                active ? "bg-primary/10 scale-110" : ""
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                active ? "text-primary font-bold" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-primary -mt-0.5" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}