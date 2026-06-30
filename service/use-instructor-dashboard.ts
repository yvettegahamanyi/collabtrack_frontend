import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import * as instructorDashboardService from "@/service/instructor-dashboard.service";

export function useInstructorDashboard() {
  return useQuery({
    queryKey: queryKeys.instructor.dashboard(),
    queryFn: () => instructorDashboardService.getInstructorDashboard(),
    refetchInterval: (query) => {
      const reports = query.state.data?.data?.all_reports ?? [];
      const hasProcessing = reports.some(
        (report) =>
          report.report_status === "PROCESSING" ||
          report.report_status === "DRAFT"
      );
      return hasProcessing ? 5000 : false;
    },
  });
}
