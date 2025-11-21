import { useQuery } from "@tanstack/react-query";
import { getManagementConfig } from "@/lib/services/api/management";
import { useSession } from "next-auth/react";

export function useManagementConfig(country: string) {
  const {data: session} = useSession()
  return useQuery({
    queryKey: ["management-config", country],
    queryFn: () => getManagementConfig(country),
    enabled: !!country && !!session,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
