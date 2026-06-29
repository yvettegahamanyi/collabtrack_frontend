"use client";

import { ChevronLeftIcon, PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { CreateAssignmentDialog } from "@/components/assignments/create-assignment-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Assignments</h2>
            <p className="text-sm text-muted-foreground">
              {assignments.length} assignment
              {assignments.length === 1 ? "" : "s"} in this class
            </p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No assignments yet. Create one to start generating reports.
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Reports</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          href={`/instructor/assignments/${assignment.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {assignment.title}
                        </Link>
                        {assignment.description && (
                          <p className="line-clamp-1 text-xs text-muted-foreground md:hidden">
                            {assignment.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          assignment.status === "ACTIVE"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {assignment.status === "ACTIVE" ? "Active" : "Done"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {assignment.report_count}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(assignment.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/instructor/assignments/${assignment.id}`}>
                          <Button size="sm" variant="outline">
                            Open
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAssignment(assignment)}
                          aria-label={`Delete ${assignment.title}`}
                        >
                          <TrashIcon className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CreateAssignmentDialog
        classId={classId}
        open={createAssignmentOpen}
        onOpenChange={setCreateAssignmentOpen}
      />
    </div>
  );
}
