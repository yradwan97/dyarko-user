import { Property } from "@/types";
import { axiosClient } from "../axios-client";

export interface InstallmentProperty extends Property {
  code: string;
  title: string;
  country: string;
  city: string;
  lat: number;
  long: number;
  image: string | null;
  contract: string | null;
  __t: string;
  price: number;
  createdAt: string;
  video: string | null;
  interiorDesign: string | null;
  purchaseContract: string | null;
}

export interface InstallmentOwner {
  _id?: string;
  name: string;
  phoneNumber: string;
  image: string;
}

export interface InstallmentUser {
  name: string;
  phoneNumber: string;
  nationalID: string;
  image: string;
}

export interface Installment {
  _id: string;
  property: InstallmentProperty;
  owner: InstallmentOwner;
  user: InstallmentUser;
  ownerStatus: "PENDING" | "APPROVED" | "REJECTED";
  userStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  amount?: number;
  endDate?: string;
  installmentPeriod?: number;
  installmentPlan?: string;
  installmentType?: string;
  startDate?: string;
  installments?: CustomInstallment[],
}

export interface CustomInstallment {
  date: string,
  amount: 250,
  _id: string
}

export interface InstallmentsResponse {
  status: string;
  message: string;
  data: {
    data: Installment[];
    itemsCount: number;
    pages: number;
  };
}

export const getApprovedInstallments = async (
  page: number = 1
): Promise<InstallmentsResponse> => {
  const response = await axiosClient.get<InstallmentsResponse>(
    `/installments/approved?page=${page}&size=10`
  );
  return response.data;
};

export interface InstallmentDetails extends Installment {
  contract?: string;
}

export interface InstallmentDetailsResponse {
  status: string;
  message: string;
  data: InstallmentDetails;
}

export const getInstallmentById = async (
  installmentId: string
): Promise<InstallmentDetailsResponse> => {
  const response = await axiosClient.get<InstallmentDetailsResponse>(
    `/installment/${installmentId}`
  );
  return response.data;
};

export type InstallmentInvoiceStatus = "PAID" | "UNPAID";

export interface InstallmentInvoice {
  _id: string;
  property: {
    _id: string;
    code: string;
    class: string;
    __t: string;
    paciNumber?: number[];
  };
  user: string;
  owner: string;
  installmentId: string;
  startDate: string;
  amount: number;
  tax: number;
  installmentType: string;
  dyarkoCommission: number;
  installmentPeriod: string;
  date: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  createdAt: string;
  updatedAt: string;
  ID: string;
  __v: number;
  pdf?: string; // PDF URL for paid invoices
}

export interface InstallmentInvoicesResponse {
  status: string;
  message: string;
  data: {
    data: InstallmentInvoice[];
    itemsCount: number;
    pages: number;
  };
}

export const getInstallmentInvoices = async (
  installmentId: string,
  status: InstallmentInvoiceStatus,
  page: number = 1
): Promise<InstallmentInvoicesResponse> => {
  // Map UI status to API status (UNPAID -> PENDING)
  const apiStatus = status === "UNPAID" ? "PENDING" : status;

  const response = await axiosClient.get<InstallmentInvoicesResponse>(
    `/installments_invoices?installmentId=${installmentId}&status=${apiStatus}&page=${page}&sort=date&order=asc`
  );
  return response.data;
};

export interface PayInstallmentInvoicePayload {
  paymentMethod: string;
  invoiceId: string;
}

export interface PayInstallmentInvoiceResponse {
  status: string;
  message: string;
  data: {
    PayUrl: string;
    sessionId: string;
  };
}

export const payInstallmentInvoice = async (
  payload: PayInstallmentInvoicePayload
): Promise<PayInstallmentInvoiceResponse> => {
  const response = await axiosClient.post<PayInstallmentInvoiceResponse>(
    `/installments_invoices/pay`,
    payload
  );
  return response.data;
};

export const downloadInstallmentInvoices = async (installmentId: string): Promise<void> => {
  const response = await axiosClient.get(
    `/installments_invoices/download/${installmentId}`,
    { responseType: 'blob' }
  );

  // Create a blob from the response
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);

  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `installment-invoices-${installmentId}.pdf`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export interface UpdateInstallmentUserStatusPayload {
  status: "APPROVED" | "REJECTED";
}

export interface UpdateInstallmentUserStatusResponse {
  status: string;
  message: string;
  data: InstallmentDetails;
}

export const updateInstallmentUserStatus = async (
  installmentId: string,
  payload: UpdateInstallmentUserStatusPayload
): Promise<UpdateInstallmentUserStatusResponse> => {
  const response = await axiosClient.put<UpdateInstallmentUserStatusResponse>(
    `/installments/${installmentId}/user`,
    payload
  );
  return response.data;
};

export interface CreateInstallmentRequestPayload {
  property: string;
}

export interface CreateInstallmentRequestResponse {
  status: string;
  message: string;
  data: Installment;
}

export const createInstallmentRequest = async (
  payload: CreateInstallmentRequestPayload
): Promise<CreateInstallmentRequestResponse> => {
  const response = await axiosClient.post<CreateInstallmentRequestResponse>(
    `/installments`,
    payload
  );
  return response.data;
};
