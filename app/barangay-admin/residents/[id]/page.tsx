import { db } from "@/db";
import {
  residents,
  households,
  documentRequests,
  blotterCases,
  programBeneficiaries,
  programs,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ResidentDetailActions } from "@/components/barangay-admin/residents/resident-detail-actions";
import Link from "next/link";

import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Heart,
  MapPin,
  Briefcase,
  CheckCircle2,
  Clock,
  BookOpen,
} from "lucide-react";
import { requireBarangayAdmin } from "@/lib/auth-helper";

function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

async function getResident(id: string, barangayId: string) {
  const [resident] = await db
    .select()
    .from(residents)
    .where(and(eq(residents.id, id), eq(residents.barangayId, barangayId)))
    .limit(1);

  return resident ?? null;
}

export default async function ResidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { barangayId } = await requireBarangayAdmin();

  const { id } = await params;
  const resident = await getResident(id, barangayId);
  if (!resident) notFound();

  // Related records
  const recentDocs = await db
    .select()
    .from(documentRequests)
    .where(eq(documentRequests.residentId, resident.id))
    .orderBy(desc(documentRequests.createdAt))
    .limit(5);

  const recentBlotter = await db
    .select()
    .from(blotterCases)
    .where(eq(blotterCases.complainantId, resident.id))
    .orderBy(desc(blotterCases.createdAt))
    .limit(5);

  const beneficiaries = await db
    .select({
      programId: programBeneficiaries.programId,
      enrolledAt: programBeneficiaries.enrolledAt,
      programName: programs.name,
      programType: programs.type,
    })
    .from(programBeneficiaries)
    .leftJoin(programs, eq(programBeneficiaries.programId, programs.id))
    .where(eq(programBeneficiaries.residentId, resident.id));

  const household = resident.householdId
    ? await db
        .select()
        .from(households)
        .where(eq(households.id, resident.householdId))
        .limit(1)
    : null;

  const age = calculateAge(resident.birthDate);

  const fullName = `${resident.firstName} ${resident.middleName ? resident.middleName + " " : ""}${resident.lastName}${resident.suffix ? " " + resident.suffix : ""}`;
  const initials =
    `${resident.firstName[0]}${resident.lastName[0]}`.toUpperCase();

  const DOC_LABELS: Record<string, string> = {
    barangay_clearance: "Barangay Clearance",
    certificate_of_residency: "Cert. of Residency",
    certificate_of_indigency: "Cert. of Indigency",
    barangay_id: "Barangay ID",
    business_clearance: "Business Clearance",
    good_moral_certificate: "Good Moral Cert.",
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/residents"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Residents
      </Link>

      {/* Header card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 ${resident.sex === "male" ? "bg-blue-500/10 text-blue-600" : "bg-pink-500/10 text-pink-600"}`}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{fullName}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {age} years old ·{" "}
                <span className="capitalize">{resident.sex}</span> ·{" "}
                <span className="capitalize">
                  {resident.civilStatus.replace("_", " ")}
                </span>
              </p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {resident.isVerified ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Clock className="h-3 w-3" /> Unverified
                  </span>
                )}
                {resident.isSeniorCitizen && (
                  <SmallTag label="Senior Citizen" color="amber" />
                )}
                {resident.isPwd && (
                  <SmallTag
                    label={`PWD${resident.pwdType ? " · " + resident.pwdType : ""}`}
                    color="purple"
                  />
                )}
                {resident.isSoloParent && (
                  <SmallTag label="Solo Parent" color="pink" />
                )}
                {resident.isRegisteredVoter && (
                  <SmallTag label="Registered Voter" color="blue" />
                )}
                {resident.isIndigenousPeople && (
                  <SmallTag label="Indigenous People" color="orange" />
                )}
                {resident.userId && (
                  <SmallTag label="Has Portal Account" color="green" />
                )}
              </div>
            </div>
          </div>
          <ResidentDetailActions resident={resident} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal info */}
          <InfoCard title="Personal Information">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Full Name"
              value={fullName}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Date of Birth"
              value={new Date(resident.birthDate).toLocaleDateString("en-PH", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            />
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Birth Place"
              value={resident.birthPlace ?? "—"}
            />
            <InfoRow
              icon={<Heart className="h-4 w-4" />}
              label="Civil Status"
              value={resident.civilStatus.replace("_", " ")}
              capitalize
            />
            <InfoRow
              icon={<BookOpen className="h-4 w-4" />}
              label="Religion"
              value={resident.religion ?? "—"}
            />
            <InfoRow
              icon={<Briefcase className="h-4 w-4" />}
              label="Occupation"
              value={resident.occupation ?? "—"}
            />
          </InfoCard>

          {/* Contact */}
          <InfoCard title="Contact Information">
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Contact Number"
              value={resident.contactNumber ?? "—"}
            />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Email"
              value={resident.email ?? "—"}
            />
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Household"
              value={
                household?.[0]
                  ? `${household[0].houseNumber ? "#" + household[0].houseNumber + " " : ""}${household[0].streetPurok ?? ""}`
                  : "—"
              }
            />
          </InfoCard>

          {/* Recent docs */}
          <InfoCard title="Recent Document Requests">
            {recentDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No document requests yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {DOC_LABELS[doc.docType] ?? doc.docType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        doc.status === "approved" || doc.status === "released"
                          ? "default"
                          : doc.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                      className="text-[10px] capitalize"
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>

          {/* Recent blotter */}
          <InfoCard title="Blotter Cases">
            {recentBlotter.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No blotter cases on record.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentBlotter.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{c.caseNumber}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-70">
                        {c.narrative}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] capitalize ml-2 shrink-0"
                    >
                      {c.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>
        </div>

        {/* Right — Programs */}
        <div className="space-y-6">
          <InfoCard title="Programs Enrolled">
            {beneficiaries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Not enrolled in any program.
              </p>
            ) : (
              <div className="space-y-3">
                {beneficiaries.map((b) => (
                  <div
                    key={b.programId}
                    className="p-3 rounded-lg border bg-muted/20"
                  >
                    <p className="text-sm font-medium">{b.programName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {b.programType?.replace("_", " ")}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Since{" "}
                      {b.enrolledAt
                        ? new Date(b.enrolledAt).toLocaleDateString("en-PH", {
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>

          <InfoCard title="Quick Stats">
            <div className="space-y-2">
              <StatRow label="Doc Requests" value={recentDocs.length} />
              <StatRow label="Blotter Cases" value={recentBlotter.length} />
              <StatRow label="Programs" value={beneficiaries.length} />
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-5 py-3.5 border-b">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </p>
        <p
          className={`text-sm font-medium mt-0.5 ${capitalize ? "capitalize" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SmallTag({ label, color }: { label: string; color: string }) {
  const styles: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    pink: "bg-pink-50 text-pink-700 border-pink-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[color] ?? ""}`}
    >
      {label}
    </span>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
