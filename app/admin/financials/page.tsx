import { requireBarangayAdmin } from "@/lib/auth-helper"
import {
  getFinancialRecords,
  getFinancialSummary,
  getAvailableFiscalYears,
} from "@/db/queries/admin/financial"
import { FinancialsClient } from "@/components/admin/financial_tab/financial-client"

export default async function FinancialsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const { barangayId } = await requireBarangayAdmin()
  const { year } = await searchParams
  const fiscalYear = year ? parseInt(year) : new Date().getFullYear()

  const [records, summary, availableYears] = await Promise.all([
    getFinancialRecords(barangayId, fiscalYear),
    getFinancialSummary(barangayId, fiscalYear),
    getAvailableFiscalYears(barangayId),
  ])

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Financials</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track income, expenses, and budget for your barangay.
        </p>
      </div>
      <FinancialsClient
        records={records}
        summary={summary}
        availableYears={availableYears}
        currentYear={fiscalYear}
      />
    </div>
  )
}