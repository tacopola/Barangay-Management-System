import { Skeleton } from "@/components/ui/skeleton"

export default function ProgramDetailLoading() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <Skeleton className="h-3 w-28 mb-3" />
        <Skeleton className="h-3 w-40 mb-2" />
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Program info card */}
      <div className="border rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      {/* Beneficiaries table */}
      <div className="border rounded-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}