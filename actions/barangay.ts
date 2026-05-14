"use server"

import { db } from "@/db"
import { barangays } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireRole } from "@/lib/auth"

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const barangaySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  municipality: z.string().min(2, "Municipality is required"),
  province: z.string().min(2, "Province is required"),
  region: z.string().min(2, "Region is required"),
  zipCode: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
})

export type BarangayFormState = {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createBarangayAction(
  _prev: BarangayFormState,
  formData: FormData
): Promise<BarangayFormState> {
  await requireRole("super_admin")

  const raw = {
    name: formData.get("name") as string,
    municipality: formData.get("municipality") as string,
    province: formData.get("province") as string,
    region: formData.get("region") as string,
    zipCode: formData.get("zipCode") as string || undefined,
    contactNumber: formData.get("contactNumber") as string || undefined,
    email: formData.get("email") as string || undefined,
  }

  const parsed = barangaySchema.safeParse(raw)
  if (!parsed.success) {
    console.error("Error parsing barangay data:", parsed.error.flatten().fieldErrors)
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    }
  }

  try {
    await db.insert(barangays).values({
      name: parsed.data.name,
      municipality: parsed.data.municipality,
      province: parsed.data.province,
      region: parsed.data.region,
      zipCode: parsed.data.zipCode,
      contactNumber: parsed.data.contactNumber,
      email: parsed.data.email || null,
      isActive: true,
    })

    revalidatePath("/super-admin/barangays")
    revalidatePath("/super-admin")
    return { success: true }
  } catch (e) {
    console.error("Error creating barangay:", e)
    return { error: "Failed to create barangay. Please try again." }
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateBarangayAction(
  id: string,
  _prev: BarangayFormState,
  formData: FormData
): Promise<BarangayFormState> {
  await requireRole("super_admin")

  const raw = {
    name: formData.get("name") as string,
    municipality: formData.get("municipality") as string,
    province: formData.get("province") as string,
    region: formData.get("region") as string,
    zipCode: formData.get("zipCode") as string || undefined,
    contactNumber: formData.get("contactNumber") as string || undefined,
    email: formData.get("email") as string || undefined,
  }

  const parsed = barangaySchema.safeParse(raw)
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    }
  }

  try {
    await db
      .update(barangays)
      .set({
        name: parsed.data.name,
        municipality: parsed.data.municipality,
        province: parsed.data.province,
        region: parsed.data.region,
        zipCode: parsed.data.zipCode,
        contactNumber: parsed.data.contactNumber,
        email: parsed.data.email || null,
        updatedAt: new Date(),
      })
      .where(eq(barangays.id, id))

    revalidatePath("/super-admin/barangays")
    revalidatePath(`/super-admin/barangays/${id}`)
    revalidatePath("/super-admin")
    return { success: true }
  } catch (e) {
    console.error("Error updating barangay:", e)
    return { error: "Failed to update barangay. Please try again." }
  }
}

// ---------------------------------------------------------------------------
// Toggle active status
// ---------------------------------------------------------------------------

export async function toggleBarangayStatusAction(
  id: string,
  isActive: boolean
): Promise<{ error?: string }> {
  await requireRole("super_admin")

  try {
    await db
      .update(barangays)
      .set({ isActive: !isActive, updatedAt: new Date() })
      .where(eq(barangays.id, id))

    revalidatePath("/super-admin/barangays")
    revalidatePath("/super-admin")
    return {}
  } catch (e) {
    console.error("Error toggling barangay status:", e)
    return { error: "Failed to update status." }
  }
}

// ---------------------------------------------------------------------------
// Delete (soft - just deactivate; hard delete only if no residents)
// ---------------------------------------------------------------------------

export async function deleteBarangayAction(
  id: string
): Promise<{ error?: string }> {
  await requireRole("super_admin")

  try {
    await db.delete(barangays).where(eq(barangays.id, id))
    revalidatePath("/super-admin/barangays")
    revalidatePath("/super-admin")
    return {}
  } catch (e) {
    console.error("Error deleting barangay:", e)
    return { error: "Cannot delete barangay. It may have existing records." }
  }
}