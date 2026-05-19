
import { requireRole } from "@/lib/auth";

export async function requireSuperAdmin() {
  const superadmin = await requireRole("super_admin");

  return {
    superadmin,
  };
}


export async function requireBarangayAdmin() {
  const admin = await requireRole("barangay_admin");

  if (!admin.barangayId) {
    throw new Error("Barangay admin has no barangay assigned.");
  }

  return {
    admin,
    barangayId: admin.barangayId,
  };
}


export async function requireResident() {
  const resident = await requireRole("resident");

  if (!resident.barangayId) {
    throw new Error("Resident has no barangay assigned.");
  }

  return {
    resident,
    barangayId: resident.barangayId,
  };
}