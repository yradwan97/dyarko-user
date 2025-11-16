import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/services/axios-client";

export interface PropertyClass {
  _id: number;
  ref: string;
  key: string;
  icon: string;
  name: string;
}

interface PropertyClassesResponse {
  data: PropertyClass[];
}

export const usePropertyClasses = (category?: string) => {
  return useQuery({
    queryKey: ["property-classes", category],
    queryFn: async () => {
      const params = category ? `?category=${category}` : "";
      const response = await axiosClient.get<PropertyClassesResponse>(
        `/properties/classes${params}`
      );
      return response.data.data;
    },
    enabled: !!category, // Only fetch when category is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
