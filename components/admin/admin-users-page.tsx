"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  Loader2Icon,
  MoreVerticalIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

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
import { fromApiRole } from "@/lib/auth";
import {
  useActivateUser,
  useAdminUsers,
  useDeactivateUser,
} from "@/service/use-admin";
import { useCurrentUser } from "@/stores/auth-store";
import type { ApiError } from "@/types";
import type { AdminUser } from "@/types/admin";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function roleLabel(role: AdminUser["role"]) {
  const mapped = fromApiRole(role);
  switch (mapped) {
    case "admin":
      return "Admin";
    case "instructor":
      return "Instructor";
    case "student":
      return "Student";
    default:
      return "Unassigned";
  }
}

function UserActions({
  user,
  currentUserId,
}: {
  user: AdminUser;
  currentUserId: string | undefined;
}) {
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const isSelf = user.id === currentUserId;
  const isPending =
    (activateUser.isPending && activateUser.variables === user.id) ||
    (deactivateUser.isPending && deactivateUser.variables === user.id);

  const handleActivate = async () => {
    try {
      await activateUser.mutateAsync(user.id);
      toast.success(`${user.email} activated`);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to activate user");
    }
  };

  const handleDeactivate = async () => {
    if (
      !confirm(
        `Deactivate ${user.email}? They will no longer be able to log in.`
      )
    ) {
      return;
    }

    try {
      await deactivateUser.mutateAsync(user.id);
      toast.success(`${user.email} deactivated`);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to deactivate user");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${user.email}`}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <MoreVerticalIcon className="size-4" />
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {user.is_active ? (
            <DropdownMenuItem
              disabled={isSelf || isPending}
              onClick={handleDeactivate}
            >
              <UserXIcon />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled={isPending} onClick={handleActivate}>
              <UserCheckIcon />
              Activate
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminUsersPage() {
  const currentUser = useCurrentUser();
  const { data, isLoading, isError } = useAdminUsers();
  const users = data?.data ?? [];

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        meta: {
          isPrimary: true,
          exportLabel: "Name",
          exportValue: (row) => row.name ?? "",
        },
        cell: ({ row }) => row.original.name ?? "—",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        id: "role",
        accessorFn: (row) => roleLabel(row.role),
        header: "Role",
        meta: { exportLabel: "Role" },
      },
      {
        id: "status",
        accessorFn: (row) => (row.is_active ? "Active" : "Inactive"),
        header: "Status",
        meta: {
          exportLabel: "Status",
          exportValue: (row) => (row.is_active ? "Active" : "Inactive"),
        },
        cell: ({ row }) => (
          <DataTableStatusBadge
            label={row.original.is_active ? "Active" : "Inactive"}
            tone={row.original.is_active ? "success" : "danger"}
          />
        ),
      },
      {
        id: "created_at",
        accessorFn: (row) => formatDate(row.created_at),
        header: "Joined",
        meta: {
          exportLabel: "Joined",
          exportValue: (row) => formatDate(row.created_at),
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
            <UserActions user={row.original} currentUserId={currentUser?.id} />
          </div>
        ),
      },
    ],
    [currentUser?.id]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="View and manage all registered users on the platform."
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
            Failed to load users. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <DataTable
          columns={columns}
          data={users}
          emptyMessage="No users found."
          exportable
          exportFilename="users.csv"
          searchColumns={[
            { id: "name", label: "Name" },
            { id: "email", label: "Email" },
            { id: "role", label: "Role" },
            { id: "status", label: "Status" },
          ]}
        />
      )}
    </div>
  );
}
