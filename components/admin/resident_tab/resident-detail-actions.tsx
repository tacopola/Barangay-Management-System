"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle, Archive, Pencil, MoreHorizontal } from "lucide-react"
import { toggleVerifyResidentAction, archiveResidentAction } from "@/actions/admin/resident"
import { toast } from "sonner"

type Resident = {
  id: string
  isVerified: boolean
  isArchived: boolean
  firstName: string
  lastName: string
}

export function ResidentDetailActions({ resident }: { resident: Resident }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleVerify() {
    startTransition(async () => {
      const res = await toggleVerifyResidentAction(resident.id, resident.isVerified)
      if (res.error) toast.error(res.error)
      else toast.success(`${resident.isVerified ? "Unverified" : "Verified"} successfully.`)
      router.refresh()
    })
  }

  function handleArchive() {
    startTransition(async () => {
      const res = await archiveResidentAction(resident.id, resident.isArchived)
      if (res.error) toast.error(res.error)
      else toast.success(`Resident ${resident.isArchived ? "restored" : "archived"}.`)
      router.back()
    })
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        variant="outline"
        size="sm"
        className="text-xs h-8 gap-1.5"
        onClick={handleVerify}
        disabled={isPending}
      >
        <CheckCircle className="h-3.5 w-3.5" />
        {resident.isVerified ? "Unverify" : "Verify"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Resident
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleArchive}
          >
            <Archive className="h-3.5 w-3.5 mr-2" />
            {resident.isArchived ? "Restore" : "Archive"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}