import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/services/axios-client";

export interface PaymentMethod {
  name: string;
  key: string;
  logo: string;
}

export function useGetPaymentMethods(enabled: boolean = true) {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const response = await axiosClient.get("/static/payment-methods");
      return response.data.data as PaymentMethod[];
    },
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes - payment methods don't change often
  });
}
