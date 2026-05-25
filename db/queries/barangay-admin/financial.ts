import { db } from "@/db"
import { financialRecords, users } from "@/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"
import { unstable_cache } from "next/cache"


export const getFinancialRecords = (barangayId: string, fiscalYear?: number) =>
  unstable_cache(
    async () => {
      const year = fiscalYear ?? new Date().getFullYear()
      return db
        .select({
          id: financialRecords.id,
          type: financialRecords.type,
          amount: financialRecords.amount,
          category: financialRecords.category,
          description: financialRecords.description,
          referenceNumber: financialRecords.referenceNumber,
          transactionDate: financialRecords.transactionDate,
          fiscalYear: financialRecords.fiscalYear,
          quarter: financialRecords.quarter,
          createdAt: financialRecords.createdAt,
          recordedByFirstName: users.firstName,
          recordedByLastName: users.lastName,
        })
        .from(financialRecords)
        .leftJoin(users, eq(financialRecords.recordedById, users.id))
        .where(
          and(
            eq(financialRecords.barangayId, barangayId),
            eq(financialRecords.fiscalYear, year),
          ),
        )
        .orderBy(desc(financialRecords.transactionDate))
    },
    [`financials-${barangayId}-${fiscalYear ?? new Date().getFullYear()}`],
    { revalidate: 30 },
  )()

export const getFinancialSummary = (barangayId: string, fiscalYear?: number) =>
  unstable_cache(
    async () => {
      const year = fiscalYear ?? new Date().getFullYear()

      const records = await db
        .select({
          type: financialRecords.type,
          amount: financialRecords.amount,
          quarter: financialRecords.quarter,
          category: financialRecords.category,
        })
        .from(financialRecords)
        .where(
          and(
            eq(financialRecords.barangayId, barangayId),
            eq(financialRecords.fiscalYear, year),
          ),
        )

      const totalIncome = records
        .filter((r) => r.type === "income")
        .reduce((s, r) => s + parseFloat(r.amount), 0)

      const totalExpense = records
        .filter((r) => r.type === "expense")
        .reduce((s, r) => s + parseFloat(r.amount), 0)

      const balance = totalIncome - totalExpense

      // Per quarter breakdown
      const quarters = [1, 2, 3, 4].map((q) => {
        const qRecords = records.filter((r) => r.quarter === q)
        return {
          quarter: q,
          income: qRecords
            .filter((r) => r.type === "income")
            .reduce((s, r) => s + parseFloat(r.amount), 0),
          expense: qRecords
            .filter((r) => r.type === "expense")
            .reduce((s, r) => s + parseFloat(r.amount), 0),
        }
      })

      // Category breakdown
      const categoryMap = new Map<string, { income: number; expense: number }>()
      records.forEach((r) => {
        const existing = categoryMap.get(r.category) ?? { income: 0, expense: 0 }
        if (r.type === "income") {
          categoryMap.set(r.category, {
            ...existing,
            income: existing.income + parseFloat(r.amount),
          })
        } else {
          categoryMap.set(r.category, {
            ...existing,
            expense: existing.expense + parseFloat(r.amount),
          })
        }
      })

      const categories = Array.from(categoryMap.entries()).map(
        ([category, amounts]) => ({ category, ...amounts }),
      )

      return {
        totalIncome,
        totalExpense,
        balance,
        quarters,
        categories,
        fiscalYear: year,
      }
    },
    [`financials-summary-${barangayId}-${fiscalYear ?? new Date().getFullYear()}`],
    { revalidate: 30 },
  )()


export const getAvailableFiscalYears = (barangayId: string) =>
  unstable_cache(
    async () => {
      const result = await db
        .selectDistinct({ fiscalYear: financialRecords.fiscalYear })
        .from(financialRecords)
        .where(eq(financialRecords.barangayId, barangayId))
        .orderBy(desc(financialRecords.fiscalYear))

      const years = result.map((r) => r.fiscalYear)

      // Always include current year
      const currentYear = new Date().getFullYear()
      if (!years.includes(currentYear)) years.unshift(currentYear)

      return years
    },
    [`financials-years-${barangayId}`],
    { revalidate: 300 },
  )()