"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ChevronLeftIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { DataTable } from "@/components/data-table";
import { DataTableStatusBadge } from "@/components/data-table-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { groupPath, ROUTES } from "@/lib/constants";
import { sortGroupsByNewest, splitGroups } from "@/lib/groups";
import { useGroups } from "@/service/use-groups";
import type { Group } from "@/types/groups";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PreviousGroupsPage() {
  const { data, isLoading, isError } = useGroups();
  const groups = data?.data ?? [];
  const previousGroups = sortGroupsByNewest(splitGroups(groups).previous);

  const columns = useMemo<ColumnDef<Group>[]>(
    () => [
      {
        accessorKey: "group_name",
        header: "Group",
        meta: {
          isPrimary: true,
          exportLabel: "Group",
        },
        cell: ({ row }) => (
          <Link
            href={groupPath(row.original.id, undefined, "student")}
            className="font-semibold text-primary hover:underline"
          >
            {row.original.group_name}
          </Link>
        ),
      },
      {
        id: "members",
        accessorFn: (row) => row.members?.length ?? 0,
        header: "Members",
        meta: { align: "right", exportLabel: "Members" },
      },
      {
        id: "created_at",
        accessorFn: (row) => formatDate(row.created_at),
        header: "Created",
        meta: {
          exportLabel: "Created",
          exportValue: (row) => formatDate(row.created_at),
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "description",
        accessorFn: (row) => row.description ?? "",
        header: "Description",
        meta: {
          exportLabel: "Description",
          exportValue: (row) => row.description ?? "",
          headerClassName: "hidden lg:table-cell",
          cellClassName: "hidden max-w-xs truncate lg:table-cell",
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.description ?? "—"}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: () => "Completed",
        header: "Status",
        meta: { exportLabel: "Status" },
        cell: () => (
          <DataTableStatusBadge label="Completed" tone="neutral" />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { align: "right", hideOnExport: true },
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${row.original.group_name}`}
                  >
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    render={
                      <Link
                        href={groupPath(row.original.id, undefined, "student")}
                      />
                    }
                  >
                    Open group
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Link href={ROUTES.studentGroups}>
        <Button variant="ghost" size="sm">
          <ChevronLeftIcon />
          Back to My Group
        </Button>
      </Link>

      <PageHeader
        title="Previous groups"
        description="All completed groups you have been part of."
      />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load groups. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <DataTable
          columns={columns}
          data={previousGroups}
          emptyMessage="No previous groups yet. Completed groups will appear here."
          exportable
          exportFilename="previous-groups.csv"
          searchColumns={[
            { id: "group_name", label: "Group" },
            { id: "description", label: "Description" },
          ]}
        />
      )}
    </div>
  );
}
