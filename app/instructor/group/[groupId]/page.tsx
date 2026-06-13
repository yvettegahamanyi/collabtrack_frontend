"use client";

import { use } from "react";

import { GroupDetailPage } from "@/components/groups/group-detail-page";

export default function InstructorGroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  return <GroupDetailPage groupId={groupId} role="instructor" />;
}
