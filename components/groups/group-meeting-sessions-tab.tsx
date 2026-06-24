"use client";

import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MeetingEngagementSummary } from "@/components/groups/meeting-engagement-summary";
import { MeetingNameMappingDialog } from "@/components/groups/meeting-name-mapping-dialog";
import { MeetingSessionsTable } from "@/components/groups/meeting-sessions-table";
import { UploadMeetingSessionDialog } from "@/components/groups/upload-meeting-session-dialog";
import { Button } from "@/components/ui/button";
import * as meetingsService from "@/service/meetings.service";
import {
  invalidateMeetingQueries,
  useMeetingSession,
} from "@/service/use-meetings";
import type { ApiError } from "@/types";
import type { Group } from "@/types/groups";
import type { MeetingSession } from "@/types/meetings";

interface GroupMeetingSessionsTabProps {
  group: Group;
  canManage: boolean;
}

export function GroupMeetingSessionsTab({
  group,
  canManage,
}: GroupMeetingSessionsTabProps) {
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [mappingSession, setMappingSession] = useState<MeetingSession | null>(
    null
  );
  const [pollingMeetingId, setPollingMeetingId] = useState<string | null>(null);

  const { data: pollingData } = useMeetingSession(group.id, pollingMeetingId, {
    poll: true,
  });

  const pollingSession = pollingData?.data;

  useEffect(() => {
    if (!pollingSession || !pollingMeetingId) return;

    const { status } = pollingSession;

    if (status === "COMPLETED") {
      toast.success("Meeting session processed successfully");
      invalidateMeetingQueries(queryClient, group.id);
      setPollingMeetingId(null);
    } else if (status === "FAILED") {
      toast.error(
        pollingSession.error_message ?? "Meeting session processing failed"
      );
      setPollingMeetingId(null);
    } else if (status === "NEEDS_MAPPING") {
      setMappingSession(pollingSession);
      setMappingOpen(true);
      setPollingMeetingId(null);
    }
  }, [pollingSession, pollingMeetingId, group.id, queryClient]);

  const handleSessionProcessed = (session: MeetingSession) => {
    invalidateMeetingQueries(queryClient, group.id);

    if (session.status === "COMPLETED") {
      toast.success("Meeting session processed successfully");
      setPollingMeetingId(null);
      return;
    }

    if (session.status === "FAILED") {
      toast.error(
        session.error_message ?? "Meeting session processing failed"
      );
      setPollingMeetingId(null);
      return;
    }

    if (session.status === "NEEDS_MAPPING") {
      setMappingSession(session);
      setMappingOpen(true);
      setPollingMeetingId(null);
      return;
    }

    setPollingMeetingId(session.id);
  };

  const handleUploaded = (session: MeetingSession) => {
    handleSessionProcessed(session);
  };

  const handleMappingSubmitted = (session: MeetingSession) => {
    handleSessionProcessed(session);
  };

  const handleMapNames = async (session: MeetingSession) => {
    try {
      const response = await meetingsService.getMeetingSession(
        group.id,
        session.id
      );
      setMappingSession(response.data);
      setMappingOpen(true);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to load session for mapping");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Meeting Sessions</h2>
          <p className="text-sm text-muted-foreground">
            Upload attendance, transcript, and chat files for {group.group_name}{" "}
            to analyze meeting engagement.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setUploadOpen(true)}>
            <PlusIcon />
            Upload Meeting Session
          </Button>
        )}
      </div>

      <MeetingEngagementSummary groupId={group.id} />

      <MeetingSessionsTable
        groupId={group.id}
        canManage={canManage}
        onMapNames={handleMapNames}
      />

      {canManage && (
        <>
          <UploadMeetingSessionDialog
            groupId={group.id}
            open={uploadOpen}
            onOpenChange={setUploadOpen}
            onUploaded={handleUploaded}
          />

          <MeetingNameMappingDialog
            groupId={group.id}
            session={mappingSession}
            members={group.members ?? []}
            open={mappingOpen}
            onOpenChange={setMappingOpen}
            onSubmitted={handleMappingSubmitted}
          />
        </>
      )}
    </div>
  );
}
