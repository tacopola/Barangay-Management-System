"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  type AnnouncementFormState,
} from "@/actions/barangay-admin/announcement";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Pin,
  Megaphone,
  Loader2,
  Globe,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, isPast } from "date-fns";

type Announcement = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  expiresAt: Date | null;
  barangayId: string | null; // null = municipality-wide
  createdAt: Date;
  postedByFirstName: string | null;
  postedByLastName: string | null;
};

const initialState: AnnouncementFormState = {};

function AnnouncementForm({
  announcement,
  onSuccess,
}: {
  announcement?: Announcement;
  onSuccess: () => void;
}) {
  const isEdit = !!announcement;
  const boundUpdate = announcement
    ? updateAnnouncementAction.bind(null, announcement.id)
    : null;

  const [state, formAction, isPending] = useActionState(
    isEdit ? boundUpdate! : createAnnouncementAction,
    initialState,
  );

  const [pinned, setPinned] = useState(announcement?.isPinned ?? false);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="isPinned" value={String(pinned)} />

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Announcement title"
          defaultValue={announcement?.title}
        />
        {state.fieldErrors?.title && (
          <p className="text-xs text-destructive">{state.fieldErrors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          name="body"
          placeholder="Write your announcement here..."
          rows={5}
          defaultValue={announcement?.body}
        />
        {state.fieldErrors?.body && (
          <p className="text-xs text-destructive">{state.fieldErrors.body}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="expiresAt">
          Expires At{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="expiresAt"
          name="expiresAt"
          type="datetime-local"
          defaultValue={
            announcement?.expiresAt
              ? format(new Date(announcement.expiresAt), "yyyy-MM-dd'T'HH:mm")
              : ""
          }
        />
      </div>

      {/* Pin toggle */}
      <button
        type="button"
        onClick={() => setPinned((p) => !p)}
        className={cn(
          "w-full flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
          pinned
            ? "border-primary/30 bg-primary/5 text-primary"
            : "text-muted-foreground hover:bg-muted/40",
        )}
      >
        <Pin className={cn("h-4 w-4", pinned && "fill-primary")} />
        <span className="font-medium">
          {pinned ? "Pinned — will appear at top" : "Pin this announcement"}
        </span>
      </button>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Post Announcement"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main client
// ---------------------------------------------------------------------------

export function AnnouncementsClient({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  function isExpired(a: Announcement) {
    return a.expiresAt !== null && isPast(new Date(a.expiresAt));
  }

  const active = announcements.filter((a) => !isExpired(a));
  const expired = announcements.filter((a) => isExpired(a));

  function applySearch(list: Announcement[]) {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q),
    );
  }

  const municipalCount = announcements.filter(
    (a) => a.barangayId === null,
  ).length;
  const pinnedCount = announcements.filter((a) => a.isPinned).length;

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(a: Announcement) {
    setEditTarget(a);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteAnnouncementAction(deleteTarget.id);
    setDeleting(false);
    if (result.error) toast.error(result.error);
    else toast.success("Announcement deleted.");
    setDeleteTarget(null);
  }

  function postedBy(a: Announcement) {
    if (!a.postedByFirstName) return "Unknown";
    return `${a.postedByFirstName} ${a.postedByLastName}`;
  }

  function AnnouncementCard({ a }: { a: Announcement }) {
    const isMunicipal = a.barangayId === null;
    return (
      <div
        className={cn(
          "rounded-lg border bg-card p-5 transition-shadow hover:shadow-sm",
          a.isPinned && "border-primary/20 bg-primary/[0.02]",
        )}
      >
        <div className="flex items-start gap-3">
          {a.isPinned && (
            <Pin className="h-3.5 w-3.5 text-primary fill-primary mt-1 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-sm leading-snug">
                    {a.title}
                  </h3>
                  {isMunicipal && (
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Globe className="h-2.5 w-2.5" />
                      Municipality
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Posted by {postedBy(a)} ·{" "}
                  {format(new Date(a.createdAt), "MMM d, yyyy")}
                  {a.expiresAt && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      Expires {format(new Date(a.expiresAt), "MMM d, yyyy")}
                    </span>
                  )}
                </p>
              </div>

              {!isMunicipal && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(a)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(a)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-3">
              {a.body}
            </p>
          </div>
        </div>
      </div>
    );
  }

  function EmptyState({ tab }: { tab: "active" | "expired" }) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-4 mb-3">
          <Megaphone className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">
          {tab === "active"
            ? "No active announcements"
            : "No expired announcements"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {search
            ? "Try a different search."
            : tab === "active"
              ? "Post your first announcement."
              : "Expired announcements will appear here."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: announcements.length },
          { label: "Municipality-wide", value: municipalCount },
          { label: "Pinned", value: pinnedCount },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expired.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {applySearch(active).length === 0 ? (
            <EmptyState tab="active" />
          ) : (
            <div className="space-y-3">
              {applySearch(active).map((a) => (
                <AnnouncementCard key={a.id} a={a} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="mt-4">
          {applySearch(expired).length === 0 ? (
            <EmptyState tab="expired" />
          ) : (
            <div className="space-y-3 opacity-60">
              {applySearch(expired).map((a) => (
                <AnnouncementCard key={a.id} a={a} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
          </DialogHeader>
          <AnnouncementForm
            announcement={editTarget ?? undefined}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
