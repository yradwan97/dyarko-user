import { useQuery } from "@tanstack/react-query";
import { getManagementConfig } from "@/lib/services/api/management";

export function useManagementConfig(country: string) {
  return useQuery({
    queryKey: ["management-config", country],
    queryFn: () => getManagementConfig(country),
    enabled: !!country,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
