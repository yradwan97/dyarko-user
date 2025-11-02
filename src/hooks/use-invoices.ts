"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvoices,
  payInvoice,
  type InvoiceStatus,
} from "@/lib/services/api/invoices";

export function useInvoices(
  rentId: string | null,
  status: InvoiceStatus,
  page: number = 1
) {
  return useQuery({
    queryKey: ["invoices", rentId, status, page],
    queryFn: () => getInvoices(rentId!, status, page),
    enabled: !!rentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function usePayInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payInvoice,
    onSuccess: () => {
      // Invalidate invoices queries to refetch
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
