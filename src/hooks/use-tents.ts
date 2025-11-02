import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/services/axios-client";

interface AvailableTentsParams {
  property: string;
  startDate: string;
  endDate: string;
}

export function useGetAvailableTents(params: AvailableTentsParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ["available-tents", params],
    queryFn: async () => {
      const response = await axiosClient.post("/rents/available-tents", params);
      return response.data.data as number[];
    },
    enabled,
  });
}
