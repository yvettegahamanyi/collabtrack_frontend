"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudUploadIcon,
  FileIcon,
  MoreVerticalIcon,
  PlusIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Group } from "@/types/groups";

/** Placeholder until transcript upload API is available. */
const MOCK_TRANSCRIPTS = [
  {
    filename: "Ethics_GroupA_Session1.pdf",
    uploadedAt: "Oct 24, 2023 10:45 AM",
    status: "Processed" as const,
  },
  {
    filename: "Ethics_GroupA_Session2.txt",
    uploadedAt: "Oct 22, 2023 3:15 PM",
    status: "Analyzing" as const,
  },
  {
    filename: "Ethics_GroupA_Session3.pdf",
    uploadedAt: "Oct 20, 2023 9:00 AM",
    status: "Processed" as const,
  },
  {
    filename: "Ethics_GroupA_Session4.txt",
    uploadedAt: "Oct 18, 2023 2:30 PM",
    status: "Processed" as const,
  },
];

interface GroupTranscriptsTabProps {
  group: Group;
}

export function GroupTranscriptsTab({ group }: GroupTranscriptsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Upload Transcript</h2>
        <p className="text-sm text-muted-foreground">
          Import session records for {group.group_name} to analyze collaborative
          dynamics and contribution metrics.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/20 px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
            <CloudUploadIcon className="size-7" />
          </span>
          <p className="mt-4 font-medium">Click to upload or drag and drop</p>
          <p className="mt-1 text-sm text-muted-foreground">
            TXT or PDF (max. 50MB)
          </p>
          <Button className="mt-4" disabled>
            <PlusIcon />
            Select File
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Transcript upload API coming soon.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Uploads</CardTitle>
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Last 30 Days
          </span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TRANSCRIPTS.map((file) => (
                <TableRow key={file.filename}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileIcon className="size-4 text-muted-foreground" />
                      <span>{file.filename}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {file.uploadedAt}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        file.status === "Processed" ? "secondary" : "outline"
                      }
                    >
                      {file.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" disabled>
                      <MoreVerticalIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {MOCK_TRANSCRIPTS.length} sample transcripts</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon-sm" disabled>
                <ChevronLeftIcon />
              </Button>
              <Button variant="outline" size="icon-sm" disabled>
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
