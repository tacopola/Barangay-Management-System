"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Pin, Trash2, Pencil, Megaphone } from "lucide-react";

import {
  deleteAnnouncementAction,
  togglePinAction,
} from "@/actions/announcement";

import { AnnouncementForm } from "./announcement-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";

type Announcement = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  barangayId: string | null;
  barangayName: string | null;
  postedBy: string | null;
};

type Barangay = {
  id: string;
  name: string;
};

export function AnnouncementListClient({
  announcements,
  barangays,
}: {
  announcements: Announcement[];
  barangays: Barangay[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);

  async function handleDelete(id: string) {
    const res = await deleteAnnouncementAction(id);

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Announcement deleted.");
  }

  async function handleTogglePin(id: string, isPinned: boolean) {
    const res = await togglePinAction(id, isPinned);

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success(isPinned ? "Announcement unpinned." : "Announcement pinned.");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);

            if (!v) {
              setSelected(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Megaphone className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selected ? "Edit Announcement" : "Create Announcement"}
              </DialogTitle>
            </DialogHeader>

            <AnnouncementForm
              announcement={selected}
              barangays={barangays}
              onSuccess={() => {
                setOpen(false);
                setSelected(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {announcements.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No announcements found.
            </CardContent>
          </Card>
        )}

        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-base">
                      {announcement.title}
                    </h2>

                    {announcement.isPinned && (
                      <Badge variant="secondary">Pinned</Badge>
                    )}

                    <Badge variant="outline">
                      {announcement.barangayName || "All Barangays"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {announcement.body}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      handleTogglePin(announcement.id, announcement.isPinned)
                    }
                  >
                    <Pin className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setSelected(announcement);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Posted by {announcement.postedBy || "Unknown"}</span>

                <div className="flex items-center gap-4">
                  {announcement.expiresAt && (
                    <span>
                      Expires {format(new Date(announcement.expiresAt), "PPP")}
                    </span>
                  )}

                  <span>
                    {format(new Date(announcement.createdAt), "PPP p")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
