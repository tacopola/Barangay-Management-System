import { requireRole } from "@/lib/auth"
import { db } from "@/db"
import {
  documentRequests, residents, barangays,
  barangayOfficials, households,
} from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { NextResponse } from "next/server"
import { generateDocument } from "@/lib/document-templates"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Allow both admin and resident to access their own docs
  const user = await requireRole("barangay_admin", "resident")

  // Fetch the document request
  const [docRequest] = await db
    .select()
    .from(documentRequests)
    .where(
      and(
        eq(documentRequests.id, id),
        eq(documentRequests.barangayId, user.barangayId!)
      )
    )
    .limit(1)

  if (!docRequest) {
    return new NextResponse("Document not found", { status: 404 })
  }

  // Only approved or released docs can be downloaded
  if (!["approved", "released"].includes(docRequest.status)) {
    return new NextResponse("Document not yet approved", { status: 403 })
  }

  // Get resident
  const [resident] = await db
    .select()
    .from(residents)
    .where(eq(residents.id, docRequest.residentId))
    .limit(1)

  if (!resident) {
    return new NextResponse("Resident not found", { status: 404 })
  }

  // Get barangay
  const [barangay] = await db
    .select()
    .from(barangays)
    .where(eq(barangays.id, user.barangayId!))
    .limit(1)

  // Get household address
  let address = `Barangay ${barangay?.name ?? ""}`
  if (resident.householdId) {
    const [household] = await db
      .select()
      .from(households)
      .where(eq(households.id, resident.householdId))
      .limit(1)

    if (household) {
      address = [
        household.houseNumber ? "#" + household.houseNumber : null,
        household.streetPurok,
        `Barangay ${barangay?.name}`,
      ].filter(Boolean).join(", ")
    }
  }

  // Get punong barangay
  const [captain] = await db
    .select({ residentId: barangayOfficials.residentId })
    .from(barangayOfficials)
    .where(
      and(
        eq(barangayOfficials.barangayId, user.barangayId!),
        eq(barangayOfficials.position, "punong_barangay"),
        eq(barangayOfficials.isActive, true)
      )
    )
    .limit(1)

  let captainName: string | null = null
  if (captain?.residentId) {
    const [captainResident] = await db
      .select({ firstName: residents.firstName, lastName: residents.lastName })
      .from(residents)
      .where(eq(residents.id, captain.residentId))
      .limit(1)

    if (captainResident) {
      captainName = `${captainResident.firstName} ${captainResident.lastName}`
    }
  }

  // Generate HTML document
  const html = generateDocument({
    controlNumber: docRequest.controlNumber ?? `DOC-${id.slice(0, 8).toUpperCase()}`,
    docType: docRequest.docType,
    purpose: docRequest.purpose,
    issuedAt: docRequest.processedAt ?? new Date(),
    resident: {
      firstName: resident.firstName,
      middleName: resident.middleName,
      lastName: resident.lastName,
      suffix: resident.suffix,
      birthDate: resident.birthDate,
      civilStatus: resident.civilStatus,
      address,
      contactNumber: resident.contactNumber,
    },
    barangay: {
      name: barangay?.name ?? "",
      municipality: barangay?.municipality ?? "",
      province: barangay?.province ?? "",
      region: barangay?.region ?? "",
    },
    captain: captainName ? { name: captainName } : null,
  })

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}