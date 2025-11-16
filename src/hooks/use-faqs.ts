import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/services/axios-client";

interface FAQ {
  _id: string;
  userType: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  __v: number;
}

interface FAQsResponse {
  status: string;
  message: string;
  data: {
    data: FAQ[];
    itemsCount: number;
    pages: number;
  };
}

export const useFAQs = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["faqs", page, limit],
    queryFn: async () => {
      const response = await axiosClient.get<FAQsResponse>(
        `/faqs?page=${page}&limit=${limit}`
      );
      return response.data.data;
    },
  });
};
