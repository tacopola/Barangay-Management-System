import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { residents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LogoutButton } from "@/components/auth/logout-resident-button";
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Heart,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";

async function getResidentProfile(userId: string) {
  const [resident] = await db
    .select()
    .from(residents)
    .where(eq(residents.userId, userId))
    .limit(1);
  return resident ?? null;
}

export default async function ResidentProfilePage() {
  const user = await requireRole("resident");
  const resident = await getResidentProfile(user.id);

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Profile header */}
      <div className="flex flex-col items-center text-center py-6 rounded-2xl border bg-card shadow-sm">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-primary">{initials}</span>
        </div>
        <h1 className="text-lg font-bold">
          {user.firstName} {user.lastName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {user.phoneNumber}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          {resident?.isVerified ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs text-emerald-600 font-medium">
                Verified Resident
              </span>
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs text-amber-600 font-medium">
                Pending Verification
              </span>
            </>
          )}
        </div>
      </div>

      {/* Personal info */}
      {resident && (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Personal Information
            </p>
          </div>
          <div className="divide-y">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Full Name"
              value={`${resident.firstName} ${resident.middleName ?? ""} ${resident.lastName} ${resident.suffix ?? ""}`.trim()}
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
              icon={<Heart className="h-4 w-4" />}
              label="Civil Status"
              value={resident.civilStatus.replace("_", " ")}
              capitalize
            />
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Contact Number"
              value={resident.contactNumber ?? "—"}
            />
            {resident.occupation && (
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label="Occupation"
                value={resident.occupation}
              />
            )}
          </div>
        </div>
      )}

      {/* Settings / actions */}
      {/* <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Account
          </p>
        </div>
        <div className="divide-y">
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors text-left">
            <span className="text-sm font-medium">Update Information</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors text-left">
            <span className="text-sm font-medium">Change Password</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div> */}

      {/* Logout */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <LogoutButton />
      </div>

      <p className="text-center text-[10px] text-muted-foreground pb-2">
        Barangay Management System · v1.0
      </p>
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
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
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
