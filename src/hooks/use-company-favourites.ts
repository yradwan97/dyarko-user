"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyFavourites } from "@/lib/services/api/favourites";

export function useCompanyFavourites(page: number = 1, enabled: boolean = true) {
  return useQuery({
    queryKey: ["company-favourites", page],
    queryFn: () => getCompanyFavourites(page),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
