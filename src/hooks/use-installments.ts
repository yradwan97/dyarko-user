import { useQuery } from "@tanstack/react-query";
import {
  getApprovedInstallments,
  getInstallmentById,
  getInstallmentInvoices,
  type InstallmentsResponse,
  type InstallmentDetailsResponse,
  type InstallmentInvoicesResponse,
  type InstallmentInvoiceStatus,
} from "@/lib/services/api/installments";

export function useApprovedInstallments(page: number = 1) {
  return useQuery<InstallmentsResponse>({
    queryKey: ["approved-installments", page],
    queryFn: () => getApprovedInstallments(page),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useInstallmentDetails(installmentId: string | null) {
  return useQuery<InstallmentDetailsResponse>({
    queryKey: ["installment-details", installmentId],
    queryFn: () => getInstallmentById(installmentId!),
    enabled: !!installmentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useInstallmentInvoices(
  installmentId: string | null,
  status: InstallmentInvoiceStatus,
  page: number = 1
) {
  return useQuery<InstallmentInvoicesResponse>({
    queryKey: ["installment-invoices", installmentId, status, page],
    queryFn: () => getInstallmentInvoices(installmentId!, status, page),
    enabled: !!installmentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
