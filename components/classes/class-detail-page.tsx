"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  MoreVerticalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { CreateAssignmentDialog } from "@/components/assignments/create-assignment-dialog";
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
import { useDeleteAssignment } from "@/service/use-assignments";
import { useClass, useDeleteClass } from "@/service/use-classes";
import type { ApiError } from "@/types";
import type { Assignment } from "@/types/assignments";

interface ClassDetailPageProps {
  classId: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ClassDetailPage({ classId }: ClassDetailPageProps) {
  const { data, isLoading, isError } = useClass(classId);
  const deleteClass = useDeleteClass();
  const deleteAssignment = useDeleteAssignment(classId);
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);

  const courseClass = data?.data;
  const assignments = courseClass?.assignments ?? [];

  const handleDeleteClass = async () => {
    if (!courseClass || !confirm(`Delete class "${courseClass.name}"?`)) return;
    try {
      await deleteClass.mutateAsync(classId);
      toast.success("Class deleted");
      window.location.href = "/instructor/classes";
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to delete class");
    }
  };

  const handleDeleteAssignment = async (assignment: Assignment) => {
    if (!confirm(`Delete assignment "${assignment.title}"?`)) return;
    try {
      await deleteAssignment.mutateAsync(assignment.id);
      toast.success("Assignment deleted");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to delete assignment");
    }
  };

  const columns = useMemo<ColumnDef<Assignment>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        meta: {
          isPrimary: true,
          exportLabel: "Title",
        },
        cell: ({ row }) => (
          <div className="space-y-1">
            <Link
              href={`/instructor/assignments/${row.original.id}`}
              className="font-semibold text-primary hover:underline"
            >
              {row.original.title}
            </Link>
            {row.original.description && (
              <p className="line-clamp-1 text-xs text-muted-foreground md:hidden">
                {row.original.description}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          exportLabel: "Status",
          exportValue: (row) => (row.status === "ACTIVE" ? "Active" : "Done"),
        },
        cell: ({ row }) => (
          <DataTableStatusBadge
            label={row.original.status === "ACTIVE" ? "Active" : "Done"}
            tone={row.original.status === "ACTIVE" ? "success" : "neutral"}
          />
        ),
      },
      {
        accessorKey: "report_count",
        header: "Reports",
        meta: { align: "right", exportLabel: "Reports" },
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.report_count}</span>
        ),
      },
      {
        id: "created_at",
        accessorFn: (row) => formatDate(row.created_at),
        header: "Created",
        meta: {
          exportLabel: "Created",
          exportValue: (row) => formatDate(row.created_at),
          headerClassName: "hidden md:table-cell",
          cellClassName: "hidden md:table-cell",
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
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
                    aria-label={`Actions for ${row.original.title}`}
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
                        href={`/instructor/assignments/${row.original.id}`}
                      />
                    }
                  >
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handleDeleteAssignment(row.original)}
                  >
                    <TrashIcon />
                    Delete
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !courseClass) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Class not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/instructor/classes">
          <Button variant="ghost" size="sm">
            <ChevronLeftIcon />
            Back to classes
          </Button>
        </Link>
      </div>

      <PageHeader
        title={courseClass.name}
        description={
          courseClass.description ?? "Manage assignments for this class."
        }
        action={
          <div className="flex gap-2">
            <Button onClick={() => setCreateAssignmentOpen(true)}>
              <PlusIcon />
              New Assignment
            </Button>
            <Button variant="outline" onClick={handleDeleteClass}>
              Delete Class
            </Button>
          </div>
        }
      />

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Assignments</h2>
          <p className="text-sm text-muted-foreground">
            {assignments.length} assignment
            {assignments.length === 1 ? "" : "s"} in this class
          </p>
        </div>

        <DataTable
          columns={columns}
          data={assignments}
          emptyMessage="No assignments yet. Create one to start generating reports."
          exportable
          exportFilename={`${courseClass.name.replace(/\s+/g, "-").toLowerCase()}-assignments.csv`}
          searchColumns={[
            { id: "title", label: "Title" },
            { id: "status", label: "Status" },
          ]}
        />
      </div>

      <CreateAssignmentDialog
        classId={classId}
        open={createAssignmentOpen}
        onOpenChange={setCreateAssignmentOpen}
      />
    </div>
  );
}
