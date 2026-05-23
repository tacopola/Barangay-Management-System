"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import {
  updateBlotterStatusAction,
  addProceedingAction,
  escalateBlotterAction,
} from "@/actions/admin/blotter";
import { toast } from "sonner";

type Proceeding = {
  id: string;
  proceedingDate: string;
  notes: string;
  nextHearingDate: string | null;
  createdAt: Date;
};

type BlotterCase = {
  id: string;
  caseNumber: string;
  status: string;
  isEscalated: boolean | null;
  proceedings: Proceeding[];
};

export function BlotterCaseClient({
  blotterCase,
}: {
  blotterCase: BlotterCase;
}) {
  const router = useRouter();
  const [proceedingOpen, setProceedingOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const isResolved = ["settled", "dismissed", "escalated"].includes(
    blotterCase.status,
  );

  function handleSettle() {
    startTransition(async () => {
      const res = await updateBlotterStatusAction(
        blotterCase.id,
        "settled",
        resolution,
      );
      if (res.error) toast.error(res.error);
      else {
        toast.success("Case marked as settled.");
        setSettleOpen(false);
        setResolution("");
      }
      router.refresh();
    });
  }

  function handleDismiss() {
    startTransition(async () => {
      const res = await updateBlotterStatusAction(blotterCase.id, "dismissed");
      if (res.error) toast.error(res.error);
      else toast.success("Case dismissed.");
      router.refresh();
    });
  }

  function handleEscalate() {
    startTransition(async () => {
      const res = await escalateBlotterAction(blotterCase.id, escalationReason);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Case escalated.");
        setEscalateOpen(false);
        setEscalationReason("");
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => router.push("/admin/blotter")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Blotter Case
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            {blotterCase.caseNumber}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proceedings timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h2 className="text-sm font-semibold">Proceedings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {blotterCase.proceedings.length} hearing
                  {blotterCase.proceedings.length !== 1 ? "s" : ""} recorded
                </p>
              </div>
              {!isResolved && (
                <Button
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                  onClick={() => setProceedingOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Proceeding
                </Button>
              )}
            </div>

            {blotterCase.proceedings.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No proceedings recorded yet
              </div>
            ) : (
              <div className="divide-y">
                {blotterCase.proceedings.map((p, i) => (
                  <div key={p.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                        {i < blotterCase.proceedings.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Hearing #{blotterCase.proceedings.length - i}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(p.proceedingDate).toLocaleDateString(
                              "en-PH",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <p className="text-sm mt-1.5 leading-relaxed">
                          {p.notes}
                        </p>
                        {p.nextHearingDate && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 w-fit">
                            <Calendar className="h-3 w-3" />
                            Next hearing:{" "}
                            {new Date(p.nextHearingDate).toLocaleDateString(
                              "en-PH",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions panel */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="text-sm font-semibold">Case Actions</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update the status of this case
              </p>
            </div>
            <div className="p-4 space-y-2.5">
              {isResolved ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    This case has been resolved.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    Status:{" "}
                    <span className="font-medium">
                      {blotterCase.status.replace("_", " ")}
                    </span>
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    className="w-full h-9 text-sm gap-2 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setSettleOpen(true)}
                    disabled={isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Settled
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-9 text-sm gap-2"
                    onClick={handleDismiss}
                    disabled={isPending}
                  >
                    <Clock className="h-4 w-4" />
                    Dismiss Case
                  </Button>

                  {!blotterCase.isEscalated && (
                    <Button
                      variant="outline"
                      className="w-full h-9 text-sm gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => setEscalateOpen(true)}
                      disabled={isPending}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Escalate Case
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Case info */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="text-sm font-semibold">Case Info</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <InfoRow
                label="Case Number"
                value={blotterCase.caseNumber}
                mono
              />
              <InfoRow
                label="Status"
                value={blotterCase.status.replace("_", " ")}
                capitalize
              />
              <InfoRow
                label="Proceedings"
                value={`${blotterCase.proceedings.length} hearing${blotterCase.proceedings.length !== 1 ? "s" : ""}`}
              />
              {blotterCase.isEscalated && (
                <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                  <ArrowUpRight className="h-3 w-3" />
                  Escalated to higher authority
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Proceeding Dialog */}
        <Dialog open={proceedingOpen} onOpenChange={setProceedingOpen}>
          <DialogContent className="sm:max-w-md p-8">
            <DialogHeader className="mb-4">
              <DialogTitle>Add Proceeding</DialogTitle>
              <DialogDescription>
                Record the outcome of a hearing or mediation session.
              </DialogDescription>
            </DialogHeader>
            <ProceedingForm
              caseId={blotterCase.id}
              onSuccess={() => {
                setProceedingOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Settle Dialog */}
        <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
          <DialogContent className="sm:max-w-sm p-8">
            <DialogHeader className="mb-4">
              <DialogTitle>Mark as Settled</DialogTitle>
              <DialogDescription>
                Provide the resolution agreement reached by both parties.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Resolution Details
                </Label>
                <Textarea
                  placeholder="Describe the agreement reached..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                  className="text-sm resize-none"
                />
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSettle}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Confirm Settlement"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Escalate Dialog */}
        <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
          <DialogContent className="sm:max-w-sm p-8">
            <DialogHeader className="mb-4">
              <DialogTitle>Escalate Case</DialogTitle>
              <DialogDescription>
                This will escalate the case beyond barangay jurisdiction.
                Provide the reason.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Escalation Reason</Label>
                <Textarea
                  placeholder="Why is this being escalated?"
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleEscalate}
                disabled={isPending || !escalationReason}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Escalating...
                  </>
                ) : (
                  "Escalate Case"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Proceeding form
  // ---------------------------------------------------------------------------

  function ProceedingForm({
    caseId,
    onSuccess,
  }: {
    caseId: string;
    onSuccess: () => void;
  }) {
    const [state, formAction, isPending] = useActionState(
      addProceedingAction.bind(null, caseId),
      {},
    );
    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast.success("Proceeding recorded.");
        onSuccess();
        router.refresh();
      }
    }, [state.success]);

    return (
      <form action={formAction} className="space-y-4">
        {state.error && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="proceedingDate" className="text-xs font-medium">
            Proceeding Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="proceedingDate"
            name="proceedingDate"
            type="date"
            className="h-9 text-sm"
          />
          {state.fieldErrors?.proceedingDate && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.proceedingDate}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-xs font-medium">
            Notes / Outcome <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="What happened during this hearing?"
            rows={4}
            className="text-sm resize-none"
          />
          {state.fieldErrors?.notes && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.notes}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nextHearingDate" className="text-xs font-medium">
            Next Hearing Date{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="nextHearingDate"
            name="nextHearingDate"
            type="date"
            className="h-9 text-sm"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Record Proceeding"
          )}
        </Button>
      </form>
    );
  }

  function InfoRow({
    label,
    value,
    mono,
    capitalize,
  }: {
    label: string;
    value: string;
    mono?: boolean;
    capitalize?: boolean;
  }) {
    return (
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
          {label}
        </p>
        <p
          className={`text-sm font-medium mt-0.5 ${mono ? "font-mono" : ""} ${capitalize ? "capitalize" : ""}`}
        >
          {value}
        </p>
      </div>
    );
  }
}
