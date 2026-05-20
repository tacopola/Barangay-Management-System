"use server"

import { db } from "@/db"
import { households, residents } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireRole } from "@/lib/auth"

const householdSchema = z.object({
  houseNumber: z.string().optional(),
  streetPurok: z.string().min(1, "Street / Purok is required"),
  headResidentId: z.string().uuid("Please select a head of household").optional().or(z.literal("")),
})

export type HouseholdFormState = {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
}


export async function createHouseholdAction(
  _prev: HouseholdFormState,
  formData: FormData
): Promise<HouseholdFormState> {
  const admin = await requireRole("barangay_admin")
  const barangayId = admin.barangayId!

  const raw = {
    houseNumber: formData.get("houseNumber") as string || undefined,
    streetPurok: formData.get("streetPurok") as string,
    headResidentId: formData.get("headResidentId") as string || undefined,
  }

  const parsed = householdSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    }
  }

  try {
    const [newHousehold] = await db
      .insert(households)
      .values({
        barangayId,
        houseNumber: parsed.data.houseNumber,
        streetPurok: parsed.data.streetPurok,
        headResidentId: parsed.data.headResidentId || null,
      })
      .returning({ id: households.id })

    // If head resident is set, link them to this household
    if (parsed.data.headResidentId) {
      await db
        .update(residents)
        .set({ householdId: newHousehold.id, updatedAt: new Date() })
        .where(
          and(
            eq(residents.id, parsed.data.headResidentId),
            eq(residents.barangayId, barangayId)
          )
        )
    }

    revalidatePath("/admin/households")
    return { success: true }
  } catch (e) {
      console.error("Error creating household:", e)
    return { error: "Failed to create household. Please try again." }
  }
}

export async function updateHouseholdAction(
  id: string,
  _prev: HouseholdFormState,
  formData: FormData
): Promise<HouseholdFormState> {


  const raw = {
    houseNumber: formData.get("houseNumber") as string || undefined,
    streetPurok: formData.get("streetPurok") as string,
    headResidentId: formData.get("headResidentId") as string || undefined,
  }

  const parsed = householdSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    }
  }

  try {
    await db
      .update(households)
      .set({
        houseNumber: parsed.data.houseNumber,
        streetPurok: parsed.data.streetPurok,
        headResidentId: parsed.data.headResidentId || null,
        updatedAt: new Date(),
      })
      .where(eq(households.id, id))

    revalidatePath("/admin/households")
    revalidatePath(`/admin/households/${id}`)
    return { success: true }
  } catch (e) {
    console.error("Error updating household:", e)
    return { error: "Failed to update household. Please try again." }
  }
}

export async function deleteHouseholdAction(
  id: string
): Promise<{ error?: string }> {

  try {
    // Unlink residents first
    await db
      .update(residents)
      .set({ householdId: null, updatedAt: new Date() })
      .where(eq(residents.householdId, id))

    await db.delete(households).where(eq(households.id, id))

    revalidatePath("/admin/households")
    return {}
  } catch (e) {
    console.error("Error deleting household:", e)
    return { error: "Failed to delete household." }
  }
}

export async function assignResidentToHouseholdAction(
  residentId: string,
  householdId: string | null
): Promise<{ error?: string }> {
  const admin = await requireRole("barangay_admin")

  try {
    await db
      .update(residents)
      .set({ householdId, updatedAt: new Date() })
      .where(
        and(
          eq(residents.id, residentId),
          eq(residents.barangayId, admin.barangayId!)
        )
      )

    revalidatePath("/admin/households")
    return {}
  } catch (e) {
    console.error("Error assigning resident to household:", e)
    return { error: "Failed to assign resident." }
  }
}