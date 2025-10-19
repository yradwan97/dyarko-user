"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/services";
import {
  getProperties,
  getPropertyById,
  type GetPropertiesParams,
} from "@/lib/services/api/properties";

interface PropertyType {
  name: string;
  value: string;
}

export function useGetPropertyTypes() {
  return useQuery({
    queryKey: ["propertyTypes"],
    queryFn: async () => {
      const response = await axiosClient.get("/property-types");
      return response.data as PropertyType[];
    },
  });
}

export function useGetProperties(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: async () => {
      const response = await axiosClient.get("/properties", { params });
      return response.data;
    },
  });
}

export function useProperties(params: GetPropertiesParams = {}) {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: () => getProperties(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on failure
    gcTime: 0, // Don't cache failed queries
  });
}

export function useFeaturedProperties(page: number = 1, size: number = 10) {
  return useQuery({
    queryKey: ["featured-properties", page, size],
    queryFn: () => getProperties({ page, size, isFeatured: true }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on failure
    gcTime: 0, // Don't cache failed queries
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => getPropertyById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
