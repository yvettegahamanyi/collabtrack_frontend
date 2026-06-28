"use client";

import { PageHeader } from "@/components/layout/page-header";
import { TrainingCollectionWizard } from "@/components/training/training-collection-wizard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTrainingCollections } from "@/service/use-training";

function statusVariant(status: string) {
  if (status === "COMPLETED") return "default";
  if (status === "FAILED") return "destructive";
  return "secondary";
}

export default function StudentTrainingPage() {
  const { data, isLoading } = useTrainingCollections();
  const collections = data?.data ?? [];

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
            ) : collections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No training collections yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell>{collection.dataset_group_id}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(collection.status)}>
                          {collection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(collection.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
