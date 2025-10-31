import { useQuery } from "@tanstack/react-query";
import { getCities } from "@/lib/services/api/places";

export function useCities(countryCode?: string) {
  return useQuery({
    queryKey: ["cities", countryCode],
    queryFn: () => getCities(countryCode || "KW"),
    enabled: !!countryCode,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
