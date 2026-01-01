import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/services/axios-client";

export interface RewardLevel {
  _id: string;
  level: number;
  title: string;
  reward?: number;
  rewards: number;
  rents: number;
  description?: string;
  icon: string;
  updatedAt?: string;
}

interface LevelsResponse {
  status: string;
  message: string;
  data: RewardLevel[];
}

export const useLevels = () => {
  return useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const response = await axiosClient.get<LevelsResponse>("/levels");
      // Filter to only include levels with non-null icons
      const filteredLevels = response.data.data.filter(
        (level) => level.icon !== null
      );
      // Sort by level number
      return filteredLevels.sort((a, b) => a.level - b.level);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
