import { useQuery } from "@tanstack/react-query";
import { getCountries } from "@/lib/services/api/places";

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
}
