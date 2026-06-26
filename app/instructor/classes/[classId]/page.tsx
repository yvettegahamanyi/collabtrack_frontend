import { ClassDetailPage } from "@/components/classes/class-detail-page";

export default async function InstructorClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return <ClassDetailPage classId={classId} />;
}
