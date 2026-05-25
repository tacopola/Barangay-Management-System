"use server";

import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireBarangayAdmin } from "@/lib/auth-helper";
import { createAuditLog } from "@/lib/audit/audit-log";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required"),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().optional(),
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
  const { admin, barangayId } = await requireBarangayAdmin();

  const raw = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    isPinned: formData.get("isPinned") === "true",
    expiresAt: (formData.get("expiresAt") as string) || undefined,
  };

  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const [record] = await db
      .insert(announcements)
      .values({
        barangayId,
        postedById: admin.id,
        title: parsed.data.title,
        body: parsed.data.body,
        isPinned: parsed.data.isPinned,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
      })
      .returning();

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "create",
      tableName: "announcements",
      recordId: record.id,
      newValue: record,
    });

    revalidatePath("/admin/announcements");
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
  const { admin, barangayId } = await requireBarangayAdmin();

  const raw = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    isPinned: formData.get("isPinned") === "true",
    expiresAt: (formData.get("expiresAt") as string) || undefined,
  };

  const parsed = announcementSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const existing = await db.query.announcements.findFirst({
      where: and(
        eq(announcements.id, id),
        eq(announcements.barangayId, barangayId), // can only edit own
      ),
    });
    if (!existing) return { error: "Announcement not found." };

    await db
      .update(announcements)
      .set({
        title: parsed.data.title,
        body: parsed.data.body,
        isPinned: parsed.data.isPinned,
        expiresAt: parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(announcements.id, id), eq(announcements.barangayId, barangayId)),
      );

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "update",
      tableName: "announcements",
      recordId: id,
      previousValue: existing,
      newValue: { ...existing, ...parsed.data },
    });

    revalidatePath("/admin/announcements");
    return { success: true };
  } catch (e) {
    console.error("Error updating announcement:", e);
    return { error: "Failed to update announcement. Please try again." };
  }
}

export async function deleteAnnouncementAction(
  id: string,
): Promise<{ error?: string }> {
  const { admin, barangayId } = await requireBarangayAdmin();

  try {
    const existing = await db.query.announcements.findFirst({
      where: and(
        eq(announcements.id, id),
        eq(announcements.barangayId, barangayId),
      ),
    });
    if (!existing) return { error: "Announcement not found." };

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "delete",
      tableName: "announcements",
      recordId: id,
      previousValue: existing,
    });

    await db
      .delete(announcements)
      .where(
        and(eq(announcements.id, id), eq(announcements.barangayId, barangayId)),
      );

    revalidatePath("/admin/announcements");
    return {};
  } catch (e) {
    console.error("Error deleting announcement:", e);
    return { error: "Failed to delete announcement." };
  }
}
