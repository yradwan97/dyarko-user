import axiosClient from "../axios-client";

export interface ManagementConfig {
  userAd: {
    amount: number;
    duration: number;
  };
  _id: string;
  uploadProperty: number;
  extendProperty: number;
  propertyAppearTime: number;
  reels: {
    duration: number;
    amount: number;
    upgradeAmount: number;
    extendAmount: number;
    extendDuration: number;
    amountPoints: number;
    upgradePoints: number;
    extendPoints: number;
  };
  searchPromote: {
    duration: number;
    amount: number;
    amountPoints: number;
  };
  homePromote: {
    duration: number;
    amount: number;
    amountPoints: number;
  };
  propertyVerificationPrice: number;
  tax: number;
  installment: number;
  country: string;
  currency: string;
  __v: number;
  extendAppearTime: number;
  uploadPropertyPoints: number;
  extendPropertyPoints: number;
  propertyVerificationPoints: number;
  taxPoints: number;
  installmentPoints: number;
}

export interface ManagementConfigResponse {
  status: string;
  message: string;
  data: ManagementConfig[];
}

export async function getManagementConfig(country: string): Promise<ManagementConfigResponse> {
  const response = await axiosClient.get(`/management?country=${country}`);
  return response.data;
}
