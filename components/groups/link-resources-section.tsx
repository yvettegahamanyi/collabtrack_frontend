"use client";

import { LinkIcon, RefreshCwIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import {
  useGroupDocuments,
  useGroupRepos,
  useLinkGroupDocument,
  useLinkGroupRepo,
  useSyncGroup,
  useUnlinkGroupDocument,
  useUnlinkGroupRepo,
} from "@/service/use-participation";
import type { ApiError } from "@/types";

interface LinkResourcesSectionProps {
  groupId: string;
  canManage: boolean;
}

export function LinkResourcesSection({
  groupId,
  canManage,
}: LinkResourcesSectionProps) {
  const { data: reposData, isLoading: reposLoading } = useGroupRepos(groupId);
  const { data: docsData, isLoading: docsLoading } = useGroupDocuments(groupId);
  const linkRepo = useLinkGroupRepo(groupId);
  const unlinkRepo = useUnlinkGroupRepo(groupId);
  const linkDoc = useLinkGroupDocument(groupId);
  const unlinkDoc = useUnlinkGroupDocument(groupId);
  const syncGroup = useSyncGroup(groupId);

  const [repoUrl, setRepoUrl] = useState("");
  const [docUrl, setDocUrl] = useState("");

  const repos = reposData?.data ?? [];
  const docs = docsData?.data ?? [];

  const handleLinkRepo = async () => {
    if (!repoUrl.trim()) return;
    try {
      await linkRepo.mutateAsync(repoUrl.trim());
      setRepoUrl("");
      toast.success("Repository linked");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to link repository");
    }
  };

  const handleLinkDoc = async () => {
    if (!docUrl.trim()) return;
    try {
      await linkDoc.mutateAsync(docUrl.trim());
      setDocUrl("");
      toast.success("Document linked");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to link document");
    }
  };

  const handleSync = async () => {
    try {
      const response = await syncGroup.mutateAsync();
      toast.success(
        `Synced ${response.data.members_synced} member(s) successfully`
      );
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Sync failed");
    }
  };

  if (!canManage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linked Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {reposLoading || docsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              {repos.length === 0 && docs.length === 0 ? (
                <p className="text-muted-foreground">
                  No resources linked yet. The group owner or instructor can
                  link a GitHub repo and Google Doc.
                </p>
              ) : (
                <>
                  {repos.map((repo) => (
                    <ResourceRow
                      key={repo.id}
                      label={`${repo.owner}/${repo.repo}`}
                      href={repo.url}
                    />
                  ))}
                  {docs.map((doc) => (
                    <ResourceRow
                      key={doc.id}
                      label={doc.title}
                      href={doc.url}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base">Linked Resources</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSync}
          disabled={syncGroup.isPending}
        >
          <RefreshCwIcon
            className={syncGroup.isPending ? "animate-spin" : undefined}
          />
          {syncGroup.isPending ? "Syncing…" : "Sync now"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Link a GitHub repository and Google Doc for participation tracking.
          Connect integrations in{" "}
          <Link href={ROUTES.settings} className="text-primary underline">
            Settings
          </Link>{" "}
          first.
        </p>

        <div className="space-y-3">
          <Label htmlFor="repo-url">GitHub repository URL</Label>
          <div className="flex gap-2">
            <Input
              id="repo-url"
              placeholder="https://github.com/org/project"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={linkRepo.isPending}
            />
            <Button
              type="button"
              onClick={handleLinkRepo}
              disabled={linkRepo.isPending}
            >
              <LinkIcon />
              Link
            </Button>
          </div>
          {reposLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            repos.map((repo) => (
              <LinkedItem
                key={repo.id}
                label={`${repo.owner}/${repo.repo}`}
                href={repo.url}
                onRemove={() => unlinkRepo.mutateAsync(repo.id)}
                removing={unlinkRepo.isPending}
              />
            ))
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="doc-url">Google Doc URL</Label>
          <div className="flex gap-2">
            <Input
              id="doc-url"
              placeholder="https://docs.google.com/document/d/..."
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              disabled={linkDoc.isPending}
            />
            <Button
              type="button"
              onClick={handleLinkDoc}
              disabled={linkDoc.isPending}
            >
              <LinkIcon />
              Link
            </Button>
          </div>
          {docsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            docs.map((doc) => (
              <LinkedItem
                key={doc.id}
                label={doc.title}
                href={doc.url}
                onRemove={() => unlinkDoc.mutateAsync(doc.id)}
                removing={unlinkDoc.isPending}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ResourceRow({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/50"
    >
      {label}
    </a>
  );
}

function LinkedItem({
  label,
  href,
  onRemove,
  removing,
}: {
  label: string;
  href: string;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary hover:underline"
      >
        {label}
      </a>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={removing}
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        <TrashIcon className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
