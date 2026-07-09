"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { LinkIcon, Loader2Icon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import { DataTableStatusBadge } from "@/components/data-table-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteMeetingSession, useMeetingSessions } from "@/service/use-meetings";
import type { ApiError } from "@/types";
import type { MeetingSession, MeetingSessionStatus } from "@/types/meetings";

interface MeetingSessionsTableProps {
  groupId: string;
  canManage: boolean;
  onMapNames: (session: MeetingSession) => void;
}

function statusLabel(status: MeetingSessionStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "UPLOADED":
      return "Uploaded";
    case "NEEDS_MAPPING":
      return "Needs mapping";
    case "PROCESSING":
      return "Processing";
    case "COMPLETED":
      return "Completed";
    case "FAILED":
      return "Failed";
  }
}

function statusTone(
  status: MeetingSessionStatus
): "success" | "danger" | "warning" | "neutral" | "info" {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "FAILED":
      return "danger";
    case "NEEDS_MAPPING":
      return "info";
    case "PROCESSING":
    case "UPLOADED":
      return "warning";
    default:
      return "neutral";
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MeetingSessionsTable({
  groupId,
  canManage,
  onMapNames,
}: MeetingSessionsTableProps) {
  const { data, isLoading, isError } = useMeetingSessions(groupId);
  const deleteSession = useDeleteMeetingSession(groupId);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sessions = data?.data ?? [];

  const handleDelete = async (session: MeetingSession) => {
    if (
      !confirm(
        `Delete "${session.session_label}"? Engagement scores will be recalculated.`
      )
    ) {
      return;
    }

    setDeletingId(session.id);
    try {
      await deleteSession.mutateAsync(session.id);
      toast.success("Meeting session deleted");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<MeetingSession>[]>(() => {
    const baseColumns: ColumnDef<MeetingSession>[] = [
      {
        accessorKey: "session_label",
        header: "Session",
        meta: { isPrimary: true, exportLabel: "Session" },
      },
      {
        id: "session_date",
        accessorFn: (row) => formatDate(row.session_date),
        header: "Date",
        meta: {
          exportLabel: "Date",
          exportValue: (row) => formatDate(row.session_date),
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.session_date)}
          </span>
        ),
      },
      {
        id: "duration_minutes",
        accessorFn: (row) =>
          row.duration_minutes != null ? `${row.duration_minutes} min` : "—",
        header: "Duration",
        meta: {
          align: "right",
          exportLabel: "Duration",
          exportValue: (row) =>
            row.duration_minutes != null ? String(row.duration_minutes) : "",
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.duration_minutes != null
              ? `${row.original.duration_minutes} min`
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          exportLabel: "Status",
          exportValue: (row) => statusLabel(row.status),
        },
        cell: ({ row }) => (
          <div>
            <DataTableStatusBadge
              label={statusLabel(row.original.status)}
              tone={statusTone(row.original.status)}
            />
            {row.original.status === "FAILED" && row.original.error_message && (
              <p className="mt-1 max-w-xs text-xs text-destructive">
                {row.original.error_message}
              </p>
            )}
          </div>
        ),
      },
    ];

    if (canManage) {
      baseColumns.push({
        id: "actions",
        header: "Actions",
        meta: { align: "right", hideOnExport: true },
        cell: ({ row }) => {
          const isDeleting = deletingId === row.original.id;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${row.original.session_label}`}
                      disabled={Boolean(deletingId)}
                    >
                      {isDeleting ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <MoreVerticalIcon className="size-4" />
                      )}
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    {row.original.status === "NEEDS_MAPPING" && (
                      <DropdownMenuItem
                        onClick={() => onMapNames(row.original)}
                      >
                        <LinkIcon />
                        Map names
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={isDeleting}
                      onClick={() => handleDelete(row.original)}
                    >
                      <TrashIcon />
                      {isDeleting ? "Deleting…" : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [canManage, deletingId, onMapNames]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {isError && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Failed to load meeting sessions.
          </p>
        )}

        {!isLoading && !isError && (
          <DataTable
            columns={columns}
            data={sessions}
            emptyMessage="No meeting sessions uploaded yet."
            embedded
            exportable
            exportFilename="meeting-sessions.csv"
            searchColumns={[
              { id: "session_label", label: "Session" },
              { id: "status", label: "Status" },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
