"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, DollarSign, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import PaginationControls from "@/components/shared/pagination-controls";
import PaymentMethodDialog from "@/components/dialogs/payment-method-dialog";
import { useInstallmentInvoices } from "@/hooks/use-installments";
import { payInstallmentInvoice } from "@/lib/services/api/installments";
import type { InstallmentInvoice, InstallmentInvoiceStatus } from "@/lib/services/api/installments";
import { toast } from "sonner";
import { useCountryCurrency } from "@/hooks/use-country-currency";

interface InstallmentInvoicesTabProps {
  installmentId: string;
  currency: string;
  isTerminated: boolean;
}

export default function InstallmentInvoicesTab({
  installmentId,
  currency,
  isTerminated = false,
}: InstallmentInvoicesTabProps) {
  const t = useTranslations("User.MyRealEstates.InstallmentInvoicesTab");
  const tCommon = useTranslations("General");
  const [selectedStatus, setSelectedStatus] = useState<InstallmentInvoiceStatus>("UNPAID");
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InstallmentInvoice | null>(null);
  const queryClient = useQueryClient();
  const locale = useLocale();
  
  const { data, isLoading } = useInstallmentInvoices(installmentId, selectedStatus, currentPage);
  // const {currency} = useCountryCurrency()

  const payInvoiceMutation = useMutation({
    mutationFn: payInstallmentInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installment-invoices"] });
    },
  });

  const invoices = data?.data?.data || [];
  const totalPages = data?.data?.pages || 1;

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-green-500 text-white";
      case "PENDING":
        return "bg-yellow-500 text-white";
      case "OVERDUE":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const handlePayInvoice = (invoice: InstallmentInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async (paymentMethod: string) => {
    if (!selectedInvoice) return;

    try {
      const response = await payInvoiceMutation.mutateAsync({
        paymentMethod,
        invoiceId: selectedInvoice._id,
      });

      if (response.data?.PayUrl) {
        const paymentWindow = window.open(
          response.data.PayUrl,
          "_blank",
          "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        if (!paymentWindow) {
          toast.error(t("popup-blocked"));
          window.location.href = response.data.PayUrl;
        } else {
          const checkWindowClosed = setInterval(() => {
            if (paymentWindow.closed) {
              clearInterval(checkWindowClosed);
              // Refetch invoices after payment window closes
              window.location.reload();
            }
          }, 1000);
        }
      }
    } catch (error) {
      toast.error(t("payment-error"));
      throw error;
    }
  };

  // Sort invoices by date (earliest/upcoming first)
  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Find the upcoming unpaid invoice (first UNPAID invoice in sorted list when on UNPAID tab)
  const upcomingUnpaidIndex = selectedStatus === "UNPAID"
    ? sortedInvoices.findIndex((invoice) =>
        invoice.status.toUpperCase() === "PENDING" || invoice.status.toUpperCase() === "OVERDUE"
      )
    : -1;

  const statusTabs: InstallmentInvoiceStatus[] = ["UNPAID", "PAID"];

  return (
    <div className="space-y-4">
      {/* Status Sub-tabs */}
      <div className={`flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg ${locale === "ar" ? "flex-row-reverse" : ""}`}>
        {statusTabs.map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status);
              setCurrentPage(1);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedStatus === status
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {t(`status.${status.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8 text-main-400" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t("no-invoices")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {sortedInvoices.map((invoice, index) => {
              const isUpcomingInvoice = index === upcomingUnpaidIndex;

              return (
                <div
                  key={invoice._id}
                  className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow ${locale === "ar" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex items-start justify-between mb-3 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex items-center gap-2 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
                      <FileText className="h-5 w-5 text-main-600" />
                      <div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {t("invoice-number")} <p>{invoice.ID}</p>
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>

                  <div className={`flex min-w-full gap-20 mb-3 ${locale === "ar" ? "text-right justify-end" : "text-left"}`}>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t("amount")}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.amount} {currency}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t("due-date")}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(invoice.date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t("tax")}: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{invoice.tax} {currency}</span>
                    </div>
                  </div>

                  {/* Pay Now Button for upcoming unpaid invoice only */}
                  {!isTerminated && isUpcomingInvoice && (
                    <Button
                      onClick={() => handlePayInvoice(invoice)}
                      className="w-full mt-4 bg-[#1e3a5f] hover:bg-[#152942] text-white"
                    >
                      {t("pay-now")}
                    </Button>
                  )}

                  {/* PDF Link for Paid Invoices */}
                  {invoice.status === "PAID" && invoice.userPdf && (
                    <a
                      href={invoice.userPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-2 text-sm font-medium text-main-600 dark:text-main-400 hover:text-main-700 dark:hover:text-main-300 border border-main-600 dark:border-main-400 rounded-lg hover:bg-main-50 dark:hover:bg-main-900/20 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      {t("view-invoice")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            disabled={isLoading}
          />
        </>
      )}

      {/* Payment Method Dialog */}
      <PaymentMethodDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onConfirm={handleConfirmPayment}
        amount={selectedInvoice?.amount}
        currency={currency}
      />
    </div>
  );
}
