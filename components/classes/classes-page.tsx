"use client";

import { BookOpenIcon, PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { CreateClassDialog } from "@/components/classes/create-class-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClasses, useDeleteClass } from "@/service/use-classes";
import type { ApiError } from "@/types";
import type { CourseClass } from "@/types/classes";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ClassesPage() {
  const { data, isLoading, isError } = useClasses();
  const deleteClass = useDeleteClass();
  const [createOpen, setCreateOpen] = useState(false);

  const classes = data?.data ?? [];

  const handleDelete = async (courseClass: CourseClass) => {
    if (!confirm(`Delete class "${courseClass.name}"?`)) return;
    try {
      await deleteClass.mutateAsync(courseClass.id);
      toast.success("Class deleted");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to delete class");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Manage your classes and assignments for contribution reports."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon />
            New Class
          </Button>
        }
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load classes. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && classes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpenIcon className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              No classes yet. Create your first class to get started.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Create Class
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && classes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classes.map((courseClass) => (
            <Card
              key={courseClass.id}
              className="flex flex-col transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-snug">
                  <Link
                    href={`/instructor/classes/${courseClass.id}`}
                    className="text-primary hover:underline"
                  >
                    {courseClass.name}
                  </Link>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Created {formatDate(courseClass.created_at)}
                </p>
              </CardHeader>

              <CardContent className="flex-1 space-y-3 pb-3">
                {courseClass.description ? (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {courseClass.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No description
                  </p>
                )}
                <p className="text-sm font-medium">
                  {courseClass.assignment_count} assignment
                  {courseClass.assignment_count === 1 ? "" : "s"}
                </p>
              </CardContent>

              <CardFooter className="gap-2 border-t bg-muted/20 pt-4">
                <Link href={`/instructor/classes/${courseClass.id}`} className="flex-1">
                  <Button size="sm" className="w-full">
                    Open class
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(courseClass)}
                  disabled={deleteClass.isPending}
                  aria-label={`Delete ${courseClass.name}`}
                >
                  <TrashIcon className="size-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreateClassDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
