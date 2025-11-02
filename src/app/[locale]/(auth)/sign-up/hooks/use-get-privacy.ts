import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/services/axios-client";

interface Policy {
  _id: string;
  type: string;
  file: string | null;
  contentAr: string;
  contentEn: string;
  createdAt: string;
  updatedAt: string;
}

export const useGetPrivacyPolicy = () => {
  const { data, isSuccess, isLoading, error } = useQuery({
    queryKey: ["privacy-policy"],
    queryFn: async () => {
      const response = await axiosClient.get("/settings/privacy_policy");
      const allPolicies = response.data.data.data as Policy[];
      // Filter by type "user"
      return allPolicies.filter(policy => policy.type === "user");
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    policies: data || [],
    isSuccess,
    isLoading,
    error,
  };
};
