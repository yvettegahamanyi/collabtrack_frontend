"use client";

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DownloadIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    isPrimary?: boolean;
    align?: "left" | "right" | "center";
    headerClassName?: string;
    cellClassName?: string;
    exportLabel?: string;
    exportValue?: (row: TData) => string;
    hideOnExport?: boolean;
  }
}

export interface DataTableSearchColumn {
  id: string;
  label: string;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  searchable?: boolean;
  searchColumns?: DataTableSearchColumn[];
  searchPlaceholder?: string;
  exportable?: boolean;
  exportFilename?: string;
  paginated?: boolean;
  pageSize?: number;
  embedded?: boolean;
  toolbar?: boolean;
  className?: string;
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) =>
    `"${value.replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getHeaderLabel<TData, TValue>(
  column: ColumnDef<TData, TValue>
): string {
  if (column.meta?.exportLabel) return column.meta.exportLabel;
  if (typeof column.header === "string") return column.header;
  if ("accessorKey" in column && typeof column.accessorKey === "string") {
    return column.accessorKey;
  }
  if (column.id) return column.id;
  return "Column";
}

function getCellExportValue<TData, TValue>(
  row: TData,
  column: ColumnDef<TData, TValue>
): string {
  if (column.meta?.exportValue) {
    return column.meta.exportValue(row);
  }

  if ("accessorKey" in column && typeof column.accessorKey === "string") {
    const value = (row as Record<string, unknown>)[column.accessorKey];
    return value == null ? "" : String(value);
  }

  if ("accessorFn" in column && column.accessorFn) {
    const value = column.accessorFn(row, 0);
    return value == null ? "" : String(value);
  }

  return "";
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "No results.",
  searchable = true,
  searchColumns,
  searchPlaceholder = "Search",
  exportable = false,
  exportFilename = "export.csv",
  paginated,
  pageSize = 10,
  embedded = false,
  toolbar,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchColumn, setSearchColumn] = useState<string>("all");

  const resolvedSearchColumns = useMemo(() => {
    if (searchColumns?.length) return searchColumns;

    return columns
      .filter((column) => {
        const id =
          column.id ??
          ("accessorKey" in column ? String(column.accessorKey) : undefined);
        return id && id !== "actions" && !column.meta?.hideOnExport;
      })
      .map((column) => ({
        id:
          column.id ??
          ("accessorKey" in column ? String(column.accessorKey) : "column"),
        label: getHeaderLabel(column),
      }));
  }, [columns, searchColumns]);

  const showPagination = paginated ?? data.length > pageSize;
  const showToolbar =
    toolbar ?? ((searchable || exportable) && data.length > 0);

  // TanStack Table returns non-memoizable functions; React Compiler skips it.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: searchable ? globalFilter : "",
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase().trim();
      if (!query) return true;

      if (searchColumn !== "all") {
        const value = row.getValue(searchColumn);
        return String(value ?? "")
          .toLowerCase()
          .includes(query);
      }

      return resolvedSearchColumns.some(({ id }) => {
        const value = row.getValue(id);
        return String(value ?? "")
          .toLowerCase()
          .includes(query);
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize },
    },
  });

  const handleExport = () => {
    const exportColumns = columns.filter(
      (column) =>
        column.id !== "actions" &&
        !column.meta?.hideOnExport &&
        (column.id || ("accessorKey" in column && column.accessorKey))
    );

    const headers = exportColumns.map((column) => getHeaderLabel(column));
    const rows = table
      .getFilteredRowModel()
      .rows.map((row) =>
        exportColumns.map((column) => getCellExportValue(row.original, column))
      );

    downloadCsv(exportFilename, headers, rows);
  };

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const currentPageSize = table.getState().pagination.pageSize;
  const pageStart = filteredCount === 0 ? 0 : pageIndex * currentPageSize + 1;
  const pageEnd = Math.min((pageIndex + 1) * currentPageSize, filteredCount);
  const totalPages = Math.max(table.getPageCount(), 1);

  return (
    <div
      className={cn(
        !embedded && "overflow-hidden rounded-xl border bg-card shadow-sm",
        className
      )}
    >
      {showToolbar && (
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {searchable ? (
            <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-lg border bg-background">
              <div className="flex flex-1 items-center gap-2 px-3">
                <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  value={globalFilter}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          ) : (
            <div />
          )}

          {exportable && (
            <Button
              variant="outline"
              className="shrink-0 border-primary text-primary hover:bg-primary/5 hover:text-primary"
              onClick={handleExport}
            >
              <DownloadIcon className="size-4" />
              Export CSV
            </Button>
          )}
        </div>
      )}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b bg-muted/20 hover:bg-muted/20"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "h-11 px-4 text-xs font-medium tracking-wide text-muted-foreground",
                    header.column.columnDef.meta?.align === "right" &&
                      "text-right",
                    header.column.columnDef.meta?.align === "center" &&
                      "text-center",
                    header.column.columnDef.meta?.headerClassName
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "px-4 py-3.5 align-middle",
                      cell.column.columnDef.meta?.isPrimary &&
                        "font-semibold text-foreground",
                      cell.column.columnDef.meta?.align === "right" &&
                        "text-right",
                      cell.column.columnDef.meta?.align === "center" &&
                        "text-center",
                      cell.column.columnDef.meta?.cellClassName
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 px-4 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showPagination && filteredCount > 0 && (
        <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Showing {pageStart} to {pageEnd} of {filteredCount} entries
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Page</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={pageIndex + 1}
                onChange={(event) => {
                  const nextPage = Number(event.target.value);
                  if (
                    Number.isFinite(nextPage) &&
                    nextPage >= 1 &&
                    nextPage <= totalPages
                  ) {
                    table.setPageIndex(nextPage - 1);
                  }
                }}
                className="h-8 w-14 px-2 text-center tabular-nums"
              />
              <span className="text-muted-foreground">of {totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
