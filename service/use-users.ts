import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Paginated, User } from "@/types";

/**
 * Example TanStack Query hook. Mirror this pattern for other resources:
 * define the key in `query-keys.ts` and call the typed `api` client. The auth
 * token is attached automatically by the Axios request interceptor.
 */
export function useUsers(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => api.get<Paginated<User>>("/users", { params }),
  });
}
