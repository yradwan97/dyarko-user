"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/services";
import {
  getProperties,
  getPropertyById,
  getMapProperties,
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
    staleTime: 10000
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

export function useFeaturedProperties(
  page: number = 1,
  size: number = 10,
  country?: string
) {
  return useQuery({
    queryKey: ["featured-properties", page, size, country],
    queryFn: () => getProperties({ page, size, isFeatured: true, country }),
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

export function useGetPropertiesByCountry(
  country: string,
  page: number = 1,
  size: number = 30,
  category?: string,
  propertyClass?: string,
  city?: string
) {
  return useQuery({
    queryKey: ["properties-by-country", country, page, size, category, propertyClass, city],
    queryFn: () => getProperties({ country, page, size, category, class: propertyClass, city }),
    enabled: !!country,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    gcTime: 0,
  });
}

export function useMapProperties(
  city: string,
  category: string,
  propertyClass: string
) {
  return useQuery({
    queryKey: ["map-properties", city, category, propertyClass],
    queryFn: () => getMapProperties({ city, category, propertyClass }),
    enabled: !!city && !!category && !!propertyClass,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    gcTime: 0,
  });
}

// Update property user status (approve/reject tenant)
export function useUpdatePropertyUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      status,
    }: {
      propertyId: string;
      status: string;
    }) => {
      const response = await axiosClient.post("/properties/user_status", {
        property: propertyId,
        status,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate rental collection requests to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["requests", "/properties/rental_requests"] });
    },
  });
}
