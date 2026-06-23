"use client";

import { LinkIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function statusVariant(
  status: MeetingSessionStatus
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "COMPLETED":
      return "secondary";
    case "FAILED":
      return "destructive";
    case "NEEDS_MAPPING":
      return "default";
    case "PROCESSING":
    case "UPLOADED":
      return "outline";
    default:
      return "outline";
  }
}

export function MeetingSessionsTable({
  groupId,
  canManage,
  onMapNames,
}: MeetingSessionsTableProps) {
  const { data, isLoading, isError } = useMeetingSessions(groupId);
  const deleteSession = useDeleteMeetingSession(groupId);
  const sessions = data?.data ?? [];

  const handleDelete = async (session: MeetingSession) => {
    if (
      !confirm(
        `Delete "${session.session_label}"? Engagement scores will be recalculated.`
      )
    ) {
      return;
    }

    try {
      await deleteSession.mutateAsync(session.id);
      toast.success("Meeting session deleted");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to delete session");
    }
  };

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

        {!isLoading && !isError && sessions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No meeting sessions uploaded yet.
          </p>
        )}

        {!isLoading && sessions.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead>Status</TableHead>
                {canManage && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {session.session_label}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(session.session_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {session.duration_minutes} min
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(session.status)}>
                      {statusLabel(session.status)}
                    </Badge>
                    {session.status === "FAILED" && session.error_message && (
                      <p className="mt-1 max-w-xs text-xs text-destructive">
                        {session.error_message}
                      </p>
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${session.session_label}`}
                              disabled={deleteSession.isPending}
                            >
                              <MoreVerticalIcon />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onMapNames(session)}>
                              <LinkIcon />
                              Map names
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDelete(session)}
                            >
                              <TrashIcon />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
