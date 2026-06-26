import { AssignmentReportDetailPage } from "@/components/reports/assignment-report-detail-page";

export default async function InstructorAssignmentReportPage({
  params,
}: {
  params: Promise<{ assignmentId: string; groupId: string }>;
}) {
  const { assignmentId, groupId } = await params;
  return (
    <AssignmentReportDetailPage
      assignmentId={assignmentId}
      groupId={groupId}
    />
  );
}
