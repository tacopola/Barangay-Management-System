import { requireBarangayAdmin } from "@/lib/auth-helper";
import { getBlotterCase } from "@/db/queries/barangay-admin/blotter";
import { notFound } from "next/navigation";
import { BlotterCaseClient } from "@/components/admin/blotters/blotter-case-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  filed: "bg-amber-50 text-amber-700 border-amber-200",
  under_mediation: "bg-blue-50 text-blue-700 border-blue-200",
  settled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  escalated: "bg-red-50 text-red-700 border-red-200",
  dismissed: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<string, string> = {
  filed: "Filed",
  under_mediation: "Under Mediation",
  settled: "Settled",
  escalated: "Escalated",
  dismissed: "Dismissed",
};

export default async function BlotterCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { barangayId } = await requireBarangayAdmin();

  const blotterCase = await getBlotterCase(id, barangayId);
  if (!blotterCase) notFound();

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Back */}
      <Link
        href="/admin/blotter"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Blotter
      </Link>

      {/* Header */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
              Blotter Case
            </p>
            <h1 className="text-xl font-bold font-mono">
              {blotterCase.caseNumber}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Filed{" "}
              {new Date(blotterCase.createdAt).toLocaleDateString("en-PH", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${STATUS_STYLES[blotterCase.status] ?? ""}`}
          >
            {STATUS_LABELS[blotterCase.status] ?? blotterCase.status}
          </span>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
              Complainant
            </p>
            <p className="text-sm font-medium">
              {blotterCase.complainantName ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
              Respondent
            </p>
            <p className="text-sm font-medium">
              {blotterCase.respondentName ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
              Incident Date
            </p>
            <p className="text-sm">
              {new Date(blotterCase.incidentDate).toLocaleDateString("en-PH", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
              Location
            </p>
            <p className="text-sm">{blotterCase.incidentLocation ?? "—"}</p>
          </div>
        </div>

        {/* Narrative */}
        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
            Narrative
          </p>
          <p className="text-sm leading-relaxed text-foreground/90 bg-muted/30 rounded-lg p-4">
            {blotterCase.narrative}
          </p>
        </div>

        {/* Resolution if settled */}
        {blotterCase.resolution && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
              Resolution
            </p>
            <p className="text-sm leading-relaxed text-emerald-800 bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              {blotterCase.resolution}
            </p>
          </div>
        )}

        {/* Escalation reason */}
        {blotterCase.isEscalated && blotterCase.escalationReason && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
              Escalation Reason
            </p>
            <p className="text-sm leading-relaxed text-red-800 bg-red-50 rounded-lg p-4 border border-red-200">
              {blotterCase.escalationReason}
            </p>
          </div>
        )}
      </div>

      {/* Actions + Proceedings */}
      <BlotterCaseClient blotterCase={blotterCase} />
    </div>
  );
}
