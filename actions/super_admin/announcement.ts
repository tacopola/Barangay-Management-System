"use server";

import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit/audit-log";
import { requireSuperAdmin } from "@/lib/auth-helper";

const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(5, "Body must be at least 5 characters"),
  barangayId: z.string().nullable().optional(),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().optional().nullable(),
});

export type AnnouncementFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function createAnnouncementAction(
  _prev: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  const { superadmin } = await requireSuperAdmin();
  const barangayIdRaw = formData.get("barangayId") as string;
  const expiresAtRaw = formData.get("expiresAt") as string;

  const raw = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    barangayId:
      barangayIdRaw === "all" || !barangayIdRaw ? null : barangayIdRaw,
    isPinned: formData.get("isPinned") === "true",
    expiresAt: expiresAtRaw || null,
  };

  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const [created] = await db
      .insert(announcements)
      .values({
        title: parsed.data.title,
        body: parsed.data.body,
        barangayId: parsed.data.barangayId ?? null,
        isPinned: parsed.data.isPinned,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
        postedById: superadmin.id,
      })
      .returning();

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: parsed.data.barangayId ?? null,
      action: "create",
      tableName: "announcements",
      recordId: created.id,
      newValue: created,
    });

    revalidatePath("/super-admin/announcements");
    return { success: true };
  } catch (e) {
    console.error("Error creating announcement:", e);
    return { error: "Failed to create announcement. Please try again." };
  }
}

export async function updateAnnouncementAction(
  id: string,
  _prev: AnnouncementFormState,
  formData: FormData,
): Promise<AnnouncementFormState> {
  const { superadmin } = await requireSuperAdmin();
  const barangayIdRaw = formData.get("barangayId") as string;
  const expiresAtRaw = formData.get("expiresAt") as string;

  const raw = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    barangayId:
      barangayIdRaw === "all" || !barangayIdRaw ? null : barangayIdRaw,
    isPinned: formData.get("isPinned") === "true",
    expiresAt: expiresAtRaw || null,
  };

  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));

    const [updated] = await db
      .update(announcements)
      .set({
        title: parsed.data.title,
        body: parsed.data.body,
        barangayId: parsed.data.barangayId ?? null,
        isPinned: parsed.data.isPinned,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, id))
      .returning();

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: parsed.data.barangayId ?? null,
      action: "update",
      tableName: "announcements",
      recordId: id,
      previousValue: existing,
      newValue: updated,
    });

    revalidatePath("/super-admin/announcements");
    return { success: true };
  } catch (e) {
    console.error("Error updating announcement:", e);
    return { error: "Failed to update announcement. Please try again." };
  }
}

export async function togglePinAction(
  id: string,
  isPinned: boolean,
): Promise<{ error?: string }> {
  const { superadmin } = await requireSuperAdmin();
  try {
    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));

    const [updated] = await db
      .update(announcements)
      .set({
        isPinned: !isPinned,
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, id))
      .returning();

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: existing.barangayId ?? null,
      action: "update",
      tableName: "announcements",
      recordId: id,
      previousValue: existing,
      newValue: updated,
    });

    revalidatePath("/super-admin/announcements");
    return {};
  } catch (e) {
    console.error("Error updating pin status:", e);
    return { error: "Failed to update pin status." };
  }
}

export async function deleteAnnouncementAction(
  id: string,
): Promise<{ error?: string }> {
  const { superadmin } = await requireSuperAdmin();
  try {
    const [existing] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));

    await db.delete(announcements).where(eq(announcements.id, id));

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: existing?.barangayId ?? null,
      action: "delete",
      tableName: "announcements",
      recordId: id,
      previousValue: existing,
    });

    revalidatePath("/super-admin/announcements");
    return {};
  } catch (e) {
    console.error("Error deleting announcement:", e);
    return { error: "Failed to delete announcement." };
  }
}
