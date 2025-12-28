import axiosClient from "../axios-client";

export interface Claim {
  _id: string;
  claim: string;
  attachment: string;
  createdBy: "USER" | "OWNER";
  status?: string;
  comment?: string;
  rent?: string;
  property?: string;
  user?: string;
  owner?: string;
}

export interface ClaimsResponse {
  data: {
    data: Claim[];
    itemsCount: number;
    pages: number;
  };
}

export interface GetClaimsParams {
  rentId: string;
  page?: number;
  size?: number;
}

export const getTenantClaims = async ({
  rentId,
  page = 1,
  size = 8,
}: GetClaimsParams): Promise<ClaimsResponse> => {
  const response = await axiosClient.get<ClaimsResponse>(
    `/claims?rent=${rentId}&page=${page}&size=${size}`
  );
  return response.data;
};
