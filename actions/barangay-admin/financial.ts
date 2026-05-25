"use server";

import { db } from "@/db";
import { financialRecords } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireBarangayAdmin } from "@/lib/auth-helper";
import { financialTypeEnum } from "@/db/schema/enums";
import { createAuditLog } from "@/lib/audit/audit-log";

const financialSchema = z.object({
  type: z.enum(financialTypeEnum.enumValues, "Type is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Amount must be a positive number",
    }),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
  transactionDate: z.string().min(1, "Transaction date is required"),
  fiscalYear: z.string().min(4, "Fiscal year is required"),
  quarter: z.string().optional(),
});

export type FinancialFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function createFinancialRecordAction(
  _prev: FinancialFormState,
  formData: FormData,
): Promise<FinancialFormState> {
  const { admin, barangayId } = await requireBarangayAdmin();

  const raw = {
    type: formData.get("type") as string,
    amount: formData.get("amount") as string,
    category: formData.get("category") as string,
    description: (formData.get("description") as string) || undefined,
    referenceNumber: (formData.get("referenceNumber") as string) || undefined,
    transactionDate: formData.get("transactionDate") as string,
    fiscalYear: formData.get("fiscalYear") as string,
    quarter: (formData.get("quarter") as string) || undefined,
  };

  const parsed = financialSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const [record] = await db
      .insert(financialRecords)
      .values({
        barangayId,
        recordedById: admin.id,
        type: parsed.data.type,
        amount: parsed.data.amount,
        category: parsed.data.category,
        description: parsed.data.description,
        referenceNumber: parsed.data.referenceNumber,
        transactionDate: parsed.data.transactionDate,
        fiscalYear: parseInt(parsed.data.fiscalYear),
        quarter: parsed.data.quarter ? parseInt(parsed.data.quarter) : null,
      })
      .returning();

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "create",
      tableName: "financial_records",
      recordId: record.id,
      newValue: record,
    });

    revalidatePath("/admin/financials");
    return { success: true };
  } catch (e) {
    console.error("Error creating financial record:", e);
    return { error: "Failed to create record. Please try again." };
  }
}

export async function updateFinancialRecordAction(
  id: string,
  _prev: FinancialFormState,
  formData: FormData,
): Promise<FinancialFormState> {
  const { admin, barangayId } = await requireBarangayAdmin();

  const raw = {
    type: formData.get("type") as string,
    amount: formData.get("amount") as string,
    category: formData.get("category") as string,
    description: (formData.get("description") as string) || undefined,
    referenceNumber: (formData.get("referenceNumber") as string) || undefined,
    transactionDate: formData.get("transactionDate") as string,
    fiscalYear: formData.get("fiscalYear") as string,
    quarter: (formData.get("quarter") as string) || undefined,
  };

  const parsed = financialSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const existing = await db.query.financialRecords.findFirst({
      where: eq(financialRecords.id, id),
    });

    if (!existing) return { error: "Record not found." };

    await db
      .update(financialRecords)
      .set({
        type: parsed.data.type,
        amount: parsed.data.amount,
        category: parsed.data.category,
        description: parsed.data.description,
        referenceNumber: parsed.data.referenceNumber,
        transactionDate: parsed.data.transactionDate,
        fiscalYear: parseInt(parsed.data.fiscalYear),
        quarter: parsed.data.quarter ? parseInt(parsed.data.quarter) : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(financialRecords.id, id),
          eq(financialRecords.barangayId, barangayId),
        ),
      );

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "update",
      tableName: "financial_records",
      recordId: id,
      previousValue: existing,
      newValue: { ...existing, ...parsed.data },
    });

    revalidatePath("/admin/financials");
    return { success: true };
  } catch (e) {
    console.error("Error updating financial record:", e);
    return { error: "Failed to update record. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteFinancialRecordAction(
  id: string,
): Promise<{ error?: string }> {
  const { admin, barangayId } = await requireBarangayAdmin();

  try {
    const existing = await db.query.financialRecords.findFirst({
      where: eq(financialRecords.id, id),
    });

    if (!existing) return { error: "Record not found." };

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "delete",
      tableName: "financial_records",
      recordId: id,
      previousValue: existing,
    });

    await db
      .delete(financialRecords)
      .where(
        and(
          eq(financialRecords.id, id),
          eq(financialRecords.barangayId, barangayId),
        ),
      );

    revalidatePath("/admin/financials");
    return {};
  } catch (e) {
    console.error("Error deleting financial record:", e);
    return { error: "Failed to delete record." };
  }
}
