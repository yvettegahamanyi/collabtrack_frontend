"use client";

import { CheckIcon, ChevronDownIcon, SearchIcon, UsersIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Group } from "@/types/groups";

interface GroupSelectorProps {
  groups: Group[];
  value: string;
  onChange: (groupId: string) => void;
}

export function GroupSelector({ groups, value, onChange }: GroupSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = groups.find((group) => group.id === value);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return groups;
    return groups.filter((group) =>
      group.group_name.toLowerCase().includes(query)
    );
  }, [groups, search]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch("");
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-10 min-w-[240px] max-w-md justify-between gap-2 bg-background font-normal shadow-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <UsersIcon className="size-4 shrink-0 text-primary" />
              <span className="truncate text-left">
                <span className="text-muted-foreground">Group: </span>
                <span className="font-medium text-foreground">
                  {selected?.group_name ?? "Select group"}
                </span>
              </span>
            </span>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        }
      />

      <DropdownMenuContent
        align="start"
        className="w-[min(100vw-2rem,20rem)] p-0"
      >
        <div
          className="border-b p-2"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="relative">
            <SearchIcon className="auth-input-icon" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
              placeholder="Search groups…"
              className="h-9 bg-muted/40 pl-9"
              aria-label="Search groups"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto p-1.5">
          {filteredGroups.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              No groups match your search.
            </p>
          ) : (
            filteredGroups.map((group) => {
              const isSelected = group.id === value;

              return (
                <DropdownMenuItem
                  key={group.id}
                  className={cn(
                    "cursor-pointer rounded-md px-2.5 py-2.5",
                    isSelected && "bg-primary/10 text-primary focus:bg-primary/15"
                  )}
                  onClick={() => {
                    onChange(group.id);
                    handleOpenChange(false);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{group.group_name}</span>
                  {isSelected && (
                    <CheckIcon className="size-4 shrink-0 text-primary" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </div>

        {groups.length > 0 && (
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            {filteredGroups.length} of {groups.length} groups
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
