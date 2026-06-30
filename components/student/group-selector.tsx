"use client";

import { ChevronDownIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Group } from "@/types/groups";

interface GroupSelectorProps {
  groups: Group[];
  value: string;
  onChange: (groupId: string) => void;
}

export function GroupSelector({ groups, value, onChange }: GroupSelectorProps) {
  const selected = groups.find((group) => group.id === value);

  return (
    <Select
      value={value}
      onValueChange={(groupId) => {
        if (groupId) onChange(groupId);
      }}
    >
      <SelectTrigger className="h-auto w-auto gap-1 border-none bg-transparent p-0 text-sm text-muted-foreground shadow-none hover:text-foreground focus:ring-0">
        <ChevronDownIcon className="size-4" />
        <SelectValue placeholder="Select group">
          Group: {selected?.group_name ?? "Select group"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {groups.map((group) => (
          <SelectItem key={group.id} value={group.id}>
            {group.group_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
