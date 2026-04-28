import { useQuery } from '@tanstack/react-query';
import axiosClient from "@/lib/services/axios-client";

interface ContractSetting {
  _id: string;
  ownerType: string;
  offerType: string;
  propertyClass: string;
  file: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ContractFileResponse {
  data: {
    data: ContractSetting[];
  }
}

interface UseContractFileParams {
  ownerType: string;
  offerType?: string;       // defaults to 'rent'
  propertyClass: string;
}

/**
 * Fetches contract settings and returns the file URL matching the given ownerType, offerType & propertyClass
 */
export const useContractFile = ({
  ownerType,
  offerType = 'rent',
  propertyClass,
}: UseContractFileParams) => {
  return useQuery({
    queryKey: ['contract-file', ownerType, offerType, propertyClass],

    queryFn: async (): Promise<string | null> => {
      const { data } = await axiosClient.get<ContractFileResponse>('/settings/contracts');

      const matchingContract = data?.data.data?.find(
        (item) =>
          item.ownerType === ownerType &&
          item.offerType === offerType &&
          item.propertyClass === propertyClass
      );

      return matchingContract?.file ?? null;
    },

    // Only run query when all required parameters are provided
    enabled: !!ownerType && !!propertyClass,

    // Optional: good defaults for most use-cases
    staleTime: 1000 * 60 * 30,     // 30 minutes
    gcTime: 1000 * 60 * 60,        // 1 hour
    retry: 1,

    // Return null if no match is found (or you can throw if you prefer)
    select: (file) => file,
  });
};