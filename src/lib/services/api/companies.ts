import axiosClient from "../axios-client";

export interface Owner {
  name: string;
  image?: string;
}

export interface BestCompany {
  _id: string;
  propertiesCount: number;
  owner: Owner;
}

export interface BestCompaniesResponse {
  status: string;
  message: string;
  data: {
    items: BestCompany[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

export const getBestCompanies = async (
  page: number = 1,
  size: number = 10
): Promise<BestCompaniesResponse> => {
  const response = await axiosClient.get<BestCompaniesResponse>(
    `/companies/best?page=${page}&size=${size}`
  );
  return response.data;
};
