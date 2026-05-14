// components/super-admin/announcement_tab/announcement-form.tsx

"use client";

import { useActionState, useEffect } from "react";

import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/actions/announcement";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Barangay = {
  id: string;
  name: string;
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  barangayId: string | null;
  isPinned: boolean;
  expiresAt: Date | null;
};

export function AnnouncementForm({
  announcement,
  barangays,
  onSuccess,
}: {
  announcement?: Announcement | null;
  barangays: Barangay[];
  onSuccess?: () => void;
}) {
  const action = announcement
    ? updateAnnouncementAction.bind(null, announcement.id)
    : createAnnouncementAction;

  const [state, formAction, isPending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) {
      toast.success(
        announcement ? "Announcement updated." : "Announcement created.",
      );

      onSuccess?.();
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title</Label>

        <Input
          name="title"
          placeholder="Enter announcement title"
          defaultValue={announcement?.title}
        />

        {state.fieldErrors?.title && (
          <p className="text-xs text-destructive">{state.fieldErrors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Announcement Body</Label>

        <Textarea
          name="body"
          rows={6}
          placeholder="Write announcement details here..."
          defaultValue={announcement?.body}
        />

        {state.fieldErrors?.body && (
          <p className="text-xs text-destructive">{state.fieldErrors.body}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Target Barangay</Label>

          <select
            name="barangayId"
            defaultValue={announcement?.barangayId ?? "all"}
            className="w-full h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All Barangays</option>

            {barangays.map((barangay) => (
              <option key={barangay.id} value={barangay.id}>
                {barangay.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label>Expires At</Label>

          <Input
            type="datetime-local"
            name="expiresAt"
            defaultValue={
              announcement?.expiresAt
                ? new Date(announcement.expiresAt).toISOString().slice(0, 16)
                : ""
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPinned"
          name="isPinned"
          value="true"
          defaultChecked={announcement?.isPinned}
        />

        <Label htmlFor="isPinned">Pin announcement</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : announcement ? (
          "Save Changes"
        ) : (
          "Publish Announcement"
        )}
      </Button>
    </form>
  );
}
