import { useQuery } from "@tanstack/react-query";
import { getAllNationalities } from "@/lib/services/api/places";

export function useNationalities() {
  return useQuery({
    queryKey: ["nationalities"],
    queryFn: getAllNationalities,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
}
