"use client";

import { CheckIcon, CopyIcon, GraduationCapIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { MOODLE_LTI_CONFIG } from "@/lib/constants";

const SETUP_STEPS = [
  "In Moodle, go to Site administration → Plugins → Activity modules → External tool → Manage tools.",
  'Click "Configure a tool manually".',
  'Set the tool name to "CollabTrack" and choose LTI version 1.3.',
  "Enter the Client ID, Initiate login URL, Redirection URI(s), and Public keyset URL from the table below.",
  "Under LTI Advantage services, enable Assignment and Grade Services and Names and Role Provisioning.",
  'Under Privacy, set "Share launcher\'s email" to Always so CollabTrack can match Moodle users.',
  "Save the tool, add it as an External tool activity in your course, then launch it as an instructor to import groups and open CollabTrack.",
];

const CONFIG_FIELDS: { label: string; value: string }[] = [
  { label: "Initiate login URL", value: MOODLE_LTI_CONFIG.loginUrl },
  { label: "Redirection URI(s)", value: MOODLE_LTI_CONFIG.launchUrl },
  { label: "Public keyset URL", value: MOODLE_LTI_CONFIG.jwksUrl },
  { label: "Client ID", value: MOODLE_LTI_CONFIG.clientId },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="shrink-0"
      onClick={handleCopy}
      aria-label="Copy value"
    >
      {copied ? (
        <CheckIcon className="size-3.5 text-success" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </Button>
  );
}

export function MoodleIntegrationCard() {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCapIcon className="size-4" />
          Moodle Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Connect CollabTrack to Moodle as an LTI 1.3 external tool. Use the
            values below when configuring the tool in Moodle, then launch the
            activity from your course to import groups and sync grades.
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {SETUP_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Tool configuration
          </p>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Field</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {CONFIG_FIELDS.map((field) => (
                  <TableRow key={field.label}>
                    <TableCell className="font-medium">{field.label}</TableCell>
                    <TableCell className="max-w-0 whitespace-normal break-all font-mono text-xs">
                      {field.value}
                    </TableCell>
                    <TableCell>
                      <CopyButton value={field.value} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          After launching from Moodle, use{" "}
          <span className="font-medium text-foreground">Push to Moodle</span> on
          assignment reports to sync participation scores to the Moodle
          gradebook.
        </p>
      </CardContent>
    </Card>
  );
}
