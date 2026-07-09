"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { DataTable } from "@/components/data-table";
import { DataTableStatusBadge } from "@/components/data-table-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { TrainingCollectionWizard } from "@/components/training/training-collection-wizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainingCollections } from "@/service/use-training";
import type { TrainingCollection } from "@/types/training";

function statusTone(status: string) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "FAILED") return "danger" as const;
  return "warning" as const;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function StudentTrainingPage() {
  const { data, isLoading } = useTrainingCollections();
  const collections = data?.data ?? [];

  const columns = useMemo<ColumnDef<TrainingCollection>[]>(
    () => [
      {
        accessorKey: "dataset_group_id",
        header: "Group ID",
        meta: { isPrimary: true, exportLabel: "Group ID" },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: { exportLabel: "Status" },
        cell: ({ row }) => (
          <DataTableStatusBadge
            label={row.original.status}
            tone={statusTone(row.original.status)}
          />
        ),
      },
      {
        id: "created_at",
        accessorFn: (row) => formatDateTime(row.created_at),
        header: "Created",
        meta: {
          exportLabel: "Created",
          exportValue: (row) => formatDateTime(row.created_at),
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDateTime(row.original.created_at)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Training data"
        description="Collect real collaboration data, compute contribution features, and append anonymized rows to the benchmark dataset."
      />

      <div className="space-y-8">
        <TrainingCollectionWizard />

        <Card>
          <CardHeader>
            <CardTitle>Recent collections</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <DataTable
                columns={columns}
                data={collections}
                emptyMessage="No training collections yet."
                embedded
                exportable
                exportFilename="training-collections.csv"
                searchColumns={[
                  { id: "dataset_group_id", label: "Group ID" },
                  { id: "status", label: "Status" },
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
