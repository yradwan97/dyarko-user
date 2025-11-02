import axiosClient from "../axios-client";

export type InvoiceStatus = "PENDING" | "PAID" | "EXTENDED";

export interface InvoiceDetails {
  totalAmount: number;
  rent: number;
  insurance: number;
  commission: number;
  tax: number;
  services: number;
}

export interface Invoice {
  _id: string;
  invoiceType: string;
  rentID: string;
  user: string;
  owner: string;
  property: string;
  status: InvoiceStatus;
  date: string;
  paidAt: string | null;
  extendTo: string | null;
  ownerAmount: number;
  userAmount: number;
  dyarkoAmount: number;
  paymentGatewayFees: number;
  startDate: string;
  endDate: string;
  services: string[];
  transactionID: string;
  ID: string;
  details: InvoiceDetails;
  ownerPdf?: string;
  userPdf?: string;
  __v?: number;
}

export interface InvoicesResponse {
  status: string;
  message: string;
  data: {
    data: Invoice[];
    itemsCount: number;
    pages: number;
  };
}

export interface PayInvoiceResponse {
  status: string;
  message: string;
  data: {
    PayUrl: string;
    sessionId: string;
  };
}

export const getInvoices = async (
  rentId: string,
  status: InvoiceStatus,
  page: number = 1
): Promise<InvoicesResponse> => {
  const response = await axiosClient.get<InvoicesResponse>(
    `/invoices?rent=${rentId}&status=${status}&page=${page}&size=10`
  );
  return response.data;
};

export interface PayInvoicePayload {
  paymentMethod: string;
  invoiceId: string;
}

export const payInvoice = async (payload: PayInvoicePayload): Promise<PayInvoiceResponse> => {
  const response = await axiosClient.post<PayInvoiceResponse>(
    `/invoices/${payload.invoiceId}/pay`,
    { paymentMethod: payload.paymentMethod }
  );
  return response.data;
};

export const downloadRentInvoices = async (rentId: string): Promise<void> => {
  const response = await axiosClient.get(
    `/invoices/download/${rentId}`,
    { responseType: 'blob' }
  );

  // Create a blob from the response
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);

  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `rent-invoices-${rentId}.pdf`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
