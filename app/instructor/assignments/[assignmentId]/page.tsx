import { AssignmentDetailPage } from "@/components/assignments/assignment-detail-page";

export default async function InstructorAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  return <AssignmentDetailPage assignmentId={assignmentId} />;
}
