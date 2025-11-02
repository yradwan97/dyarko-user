import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/services/axios-client";

interface Term {
  _id: string;
  type: string;
  file: string | null;
  contentAr: string;
  contentEn: string;
  createdAt: string;
  updatedAt: string;
}

export const useGetTermsAndConditions = () => {
  const { data, isSuccess, isLoading, error } = useQuery({
    queryKey: ["terms-and-conditions"],
    queryFn: async () => {
      const response = await axiosClient.get("/settings/terms_conditions");
      const allTerms = response.data.data.data as Term[];
      // Filter by type "user"
      return allTerms
      // .filter(term => term.type === "user");
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    terms: data || [],
    isSuccess,
    isLoading,
    error,
  };
};
