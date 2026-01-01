import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApprovedInstallments,
  getInstallmentById,
  getInstallmentInvoices,
  updateInstallmentUserStatus,
  endInstallmentContract,
  type InstallmentsResponse,
  type InstallmentDetailsResponse,
  type InstallmentInvoicesResponse,
  type InstallmentInvoiceStatus,
  type UpdateInstallmentUserStatusPayload,
  type EndInstallmentContractPayload,
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

export function useUpdateInstallmentUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ installmentId, payload }: { installmentId: string; payload: UpdateInstallmentUserStatusPayload }) =>
      updateInstallmentUserStatus(installmentId, payload),
    onSuccess: (data, variables) => {
      // Invalidate and refetch installment details
      queryClient.invalidateQueries({ queryKey: ["installment-details", variables.installmentId] });
      // Invalidate requests list to refresh the status
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useEndInstallmentContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EndInstallmentContractPayload) => endInstallmentContract(payload),
    onSuccess: (data, variables) => {
      // Invalidate and refetch installment details
      queryClient.invalidateQueries({ queryKey: ["installment-details", variables.installment] });
      // Invalidate approved installments list
      queryClient.invalidateQueries({ queryKey: ["approved-installments"] });
    },
  });
}
