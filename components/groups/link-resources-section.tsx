"use client";

import { FileTextIcon, GitBranchIcon, LinkIcon, RefreshCwIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Linked Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {reposLoading || docsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              {repos.length === 0 && docs.length === 0 ? (
                <p className="text-muted-foreground">
                  No resources linked yet. The group owner or instructor can
                  link GitHub repos and Google Docs.
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
    <Card className="surface-card">
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <CardTitle>Linked Resources</CardTitle>
          <CardDescription>
            Connect GitHub and Google Docs to track participation across your group.
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 bg-background shadow-sm"
          onClick={handleSync}
          disabled={syncGroup.isPending}
        >
          <RefreshCwIcon
            className={syncGroup.isPending ? "animate-spin" : undefined}
          />
          {syncGroup.isPending ? "Syncing…" : "Sync now"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Metrics are combined across every linked resource when you sync.
          Connect integrations in{" "}
          <Link href={ROUTES.settings} className="font-medium text-primary hover:underline">
            Settings
          </Link>{" "}
          first.
        </p>

        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <GitBranchIcon className="size-4" />
            </span>
            <Label htmlFor="repo-url" className="text-sm font-semibold">
              GitHub repository URL
            </Label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="repo-url"
              placeholder="https://github.com/org/project"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={linkRepo.isPending}
              className="h-11 bg-background"
            />
            <Button
              type="button"
              className="shrink-0 sm:min-w-28"
              onClick={handleLinkRepo}
              disabled={linkRepo.isPending}
            >
              <LinkIcon />
              {linkRepo.isPending ? "Linking…" : "Link"}
            </Button>
          </div>
          {reposLoading ? (
            <Skeleton className="h-11 w-full rounded-lg" />
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

        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-400">
              <FileTextIcon className="size-4" />
            </span>
            <Label htmlFor="doc-url" className="text-sm font-semibold">
              Google Doc URL
            </Label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="doc-url"
              placeholder="https://docs.google.com/document/d/..."
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              disabled={linkDoc.isPending}
              className="h-11 bg-background"
            />
            <Button
              type="button"
              className="shrink-0 sm:min-w-28"
              onClick={handleLinkDoc}
              disabled={linkDoc.isPending}
            >
              <LinkIcon />
              {linkDoc.isPending ? "Linking…" : "Link"}
            </Button>
          </div>
          {docsLoading ? (
            <Skeleton className="h-11 w-full rounded-lg" />
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
      className="block rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 truncate font-medium text-primary hover:underline"
      >
        {label}
      </a>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        disabled={removing}
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        <TrashIcon className="size-4" />
      </Button>
    </div>
  );
}
