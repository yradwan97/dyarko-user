"use client";

import { useQuery } from "@tanstack/react-query";
import { getBestCompanies } from "@/lib/services/api/companies";

export function useBestCompanies(page: number = 1, size: number = 10) {
  return useQuery({
    queryKey: ["best-companies", page, size],
    queryFn: () => getBestCompanies(page, size),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
