import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/services/axios-client";

export interface RequestDetailsResponse {
  status: string;
  message: string;
  data: any;
}

export const useRequestDetails = (endpoint: string, requestId: string | null) => {
  return useQuery({
    queryKey: ["request-details", endpoint, requestId],
    queryFn: async () => {
      if (!requestId) return null;
      const response = await axiosClient.get<RequestDetailsResponse>(
        `${endpoint}/${requestId}`
      );
      return response.data;
    },
    enabled: !!requestId && !!endpoint,
    staleTime: 0,
    gcTime: 0,
  });
};
