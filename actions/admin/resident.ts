"use server";

import { db } from "@/db";
import { residents, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireBarangayAdmin } from "@/lib/auth-helper";

const residentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  sex: z.enum(["male", "female"], "Sex is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  birthPlace: z.string().optional(),
  civilStatus: z.enum(
    ["single", "married", "widowed", "separated", "annulled"],
    "Civil status is required",
  ),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  occupation: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  householdId: z.string().uuid().optional().or(z.literal("")),
  isRegisteredVoter: z.boolean().default(false),
  voterIdNumber: z.string().optional(),
  isIndigenousPeople: z.boolean().default(false),
  isSeniorCitizen: z.boolean().default(false),
  isPwd: z.boolean().default(false),
  pwdType: z.string().optional(),
  isSoloParent: z.boolean().default(false),
});

const createResidentSchema = residentSchema.extend({
  createPortalAccount: z.boolean().default(false),
  phoneNumber: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

export type ResidentFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  residentId?: string;
};

function parseCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

function parseOptional(formData: FormData, key: string) {
  const val = formData.get(key) as string;
  return val || undefined;
}

export async function createResidentAction(
  _prev: ResidentFormState,
  formData: FormData,
): Promise<ResidentFormState> {
  const { admin } = await requireBarangayAdmin();
  const barangayId = admin.barangayId!;

  const createPortalAccount = parseCheckbox(formData, "createPortalAccount");
  const phoneNumber = parseOptional(formData, "phoneNumber");
  const password = parseOptional(formData, "password");

  const raw = {
    firstName: formData.get("firstName") as string,
    middleName: parseOptional(formData, "middleName"),
    lastName: formData.get("lastName") as string,
    suffix: parseOptional(formData, "suffix"),
    sex: formData.get("sex") as string,
    birthDate: formData.get("birthDate") as string,
    birthPlace: parseOptional(formData, "birthPlace"),
    civilStatus: formData.get("civilStatus") as string,
    nationality: parseOptional(formData, "nationality") ?? "Filipino",
    religion: parseOptional(formData, "religion"),
    occupation: parseOptional(formData, "occupation"),
    contactNumber: parseOptional(formData, "contactNumber"),
    email: parseOptional(formData, "email"),
    householdId: parseOptional(formData, "householdId"),
    isRegisteredVoter: parseCheckbox(formData, "isRegisteredVoter"),
    voterIdNumber: parseOptional(formData, "voterIdNumber"),
    isIndigenousPeople: parseCheckbox(formData, "isIndigenousPeople"),
    isSeniorCitizen: parseCheckbox(formData, "isSeniorCitizen"),
    isPwd: parseCheckbox(formData, "isPwd"),
    pwdType: parseOptional(formData, "pwdType"),
    isSoloParent: parseCheckbox(formData, "isSoloParent"),
    createPortalAccount,
    phoneNumber,
    password,
  };

  const parsed = createResidentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  let userId: string | null = null;

  // Optionally create portal account
  if (createPortalAccount && phoneNumber && password) {
    const generatedEmail = `${phoneNumber.replace(/\s+/g, "")}@bms.com`;

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: generatedEmail,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      return {
        error: authError?.message ?? "Failed to create portal account.",
      };
    }

    try {
      const [newUser] = await db
        .insert(users)
        .values({
          authId: authData.user.id,
          role: "resident",
          barangayId,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: generatedEmail,
          phoneNumber,
          isActive: true,
        })
        .returning({ id: users.id });

      userId = newUser.id;
    } catch (e) {
      console.error("Error creating user record:", e);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: "Failed to create user account. Please try again." };
    }
  }

  try {
    const [newResident] = await db
      .insert(residents)
      .values({
        userId,
        barangayId,
        householdId: parsed.data.householdId || null,
        firstName: parsed.data.firstName,
        middleName: parsed.data.middleName,
        lastName: parsed.data.lastName,
        suffix: parsed.data.suffix,
        sex: parsed.data.sex,
        birthDate: parsed.data.birthDate,
        birthPlace: parsed.data.birthPlace,
        civilStatus: parsed.data.civilStatus,
        nationality: parsed.data.nationality ?? "Filipino",
        religion: parsed.data.religion,
        occupation: parsed.data.occupation,
        contactNumber: parsed.data.contactNumber,
        email: parsed.data.email || null,
        isRegisteredVoter: parsed.data.isRegisteredVoter,
        voterIdNumber: parsed.data.voterIdNumber,
        isIndigenousPeople: parsed.data.isIndigenousPeople,
        isSeniorCitizen: parsed.data.isSeniorCitizen,
        isPwd: parsed.data.isPwd,
        pwdType: parsed.data.pwdType,
        isSoloParent: parsed.data.isSoloParent,
        isVerified: true, // admin-created residents are auto-verified
        isArchived: false,
      })
      .returning({ id: residents.id });

    revalidatePath("/admin/residents");
    return { success: true, residentId: newResident.id };
  } catch (e) {
    console.error("Error creating resident:", e);
    return { error: "Failed to create resident. Please try again." };
  }
}

export async function updateResidentAction(
  id: string,
  _prev: ResidentFormState,
  formData: FormData,
): Promise<ResidentFormState> {
  const { admin } = await requireBarangayAdmin();
  const raw = {
    firstName: formData.get("firstName") as string,
    middleName: parseOptional(formData, "middleName"),
    lastName: formData.get("lastName") as string,
    suffix: parseOptional(formData, "suffix"),
    sex: formData.get("sex") as string,
    birthDate: formData.get("birthDate") as string,
    birthPlace: parseOptional(formData, "birthPlace"),
    civilStatus: formData.get("civilStatus") as string,
    nationality: parseOptional(formData, "nationality") ?? "Filipino",
    religion: parseOptional(formData, "religion"),
    occupation: parseOptional(formData, "occupation"),
    contactNumber: parseOptional(formData, "contactNumber"),
    email: parseOptional(formData, "email"),
    householdId: parseOptional(formData, "householdId"),
    isRegisteredVoter: parseCheckbox(formData, "isRegisteredVoter"),
    voterIdNumber: parseOptional(formData, "voterIdNumber"),
    isIndigenousPeople: parseCheckbox(formData, "isIndigenousPeople"),
    isSeniorCitizen: parseCheckbox(formData, "isSeniorCitizen"),
    isPwd: parseCheckbox(formData, "isPwd"),
    pwdType: parseOptional(formData, "pwdType"),
    isSoloParent: parseCheckbox(formData, "isSoloParent"),
  };

  const parsed = residentSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    await db
      .update(residents)
      .set({
        ...parsed.data,
        householdId: parsed.data.householdId || null,
        email: parsed.data.email || null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(residents.id, id), eq(residents.barangayId, admin.barangayId!)),
      );

    revalidatePath("/admin/residents");
    revalidatePath(`/admin/residents/${id}`);
    return { success: true };
  } catch (e) {
    console.error("Error updating resident:", e);
    return { error: "Failed to update resident. Please try again." };
  }
}

export async function toggleVerifyResidentAction(
  id: string,
  isVerified: boolean,
): Promise<{ error?: string }> {
  const { admin } = await requireBarangayAdmin();
  try {
    await db
      .update(residents)
      .set({ isVerified: !isVerified, updatedAt: new Date() })
      .where(
        and(eq(residents.id, id), eq(residents.barangayId, admin.barangayId!)),
      );

    revalidatePath("/admin/residents");
    revalidatePath(`/admin/residents/${id}`);
    return {};
  } catch (e) {
    console.error("Error updating verification status:", e);
    return { error: "Failed to update verification status." };
  }
}

export async function archiveResidentAction(
  id: string,
  isArchived: boolean,
): Promise<{ error?: string }> {
  const { admin } = await requireBarangayAdmin();
  try {
    await db
      .update(residents)
      .set({ isArchived: !isArchived, updatedAt: new Date() })
      .where(
        and(eq(residents.id, id), eq(residents.barangayId, admin.barangayId!)),
      );

    revalidatePath("/admin/residents");
    return {};
  } catch (e) {
    console.error("Error updating archive status:", e);
    return { error: "Failed to archive resident." };
  }
}
