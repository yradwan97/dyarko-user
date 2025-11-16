"use client";

import { useQuery } from "@tanstack/react-query";
import { getBestCompanies } from "@/lib/services/api/companies";
import { useCountryContext } from "@/components/providers/country-provider";

export function useBestCompanies(page: number = 1, size: number = 10) {
  const { selectedCountry } = useCountryContext();
  return useQuery({
    queryKey: ["best-companies", page, size, selectedCountry],
    queryFn: () => getBestCompanies(page, size, selectedCountry),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
