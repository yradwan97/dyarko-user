"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { FileText, MoreVertical, Download, Eye, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvoices, usePayInvoice } from "@/hooks/use-invoices";
import { useCountryCurrency } from "@/hooks/use-country-currency";
import type { Invoice, InvoiceStatus } from "@/lib/services/api/invoices";
import { toast } from "sonner";
import ExtendInvoiceDialog from "./extend-invoice-dialog";
import PaymentMethodDialog from "@/components/dialogs/payment-method-dialog";

interface RentInvoicesTabProps {
  rentId: string;
  propertyCountry: string;
}

export default function RentInvoicesTab({
  rentId,
  propertyCountry,
}: RentInvoicesTabProps) {
  const t = useTranslations("User.MyRealEstates.InvoicesTab");
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>("PENDING");
  const [currentPage, setCurrentPage] = useState(1);
  const [extendInvoiceData, setExtendInvoiceData] = useState<{
    id: string;
    minDate: Date;
    maxDate?: Date;
  } | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data, isLoading } = useInvoices(rentId, selectedStatus, currentPage);
  const payInvoiceMutation = usePayInvoice();
  const currency = useCountryCurrency(propertyCountry);

  const invoices = data?.data?.data || [];
  const totalPages = data?.data?.pages || 1;

  const formatDate = (date: string) => {
    return format(new Date(date), "dd\\MM\\yyyy");
  };

  const handlePayInvoice = (invoice: Invoice) => {
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

  const handleViewPdf = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank");
  };

  const handleDownloadPdf = (pdfUrl: string, invoiceId: string) => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `invoice-${invoiceId}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExtendInvoice = (invoice: Invoice, index: number) => {
    const minDate = new Date(invoice.date);
    // Next invoice is at index + 1 in sorted array
    const nextInvoice = sortedInvoices[index + 1];
    const maxDate = nextInvoice ? new Date(nextInvoice.date) : undefined;

    setExtendInvoiceData({
      id: invoice._id,
      minDate,
      maxDate,
    });
  };

  // Sort invoices by date (earliest/due first)
  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const statusTabs: InvoiceStatus[] = ["PENDING", "PAID", "EXTENDED"];

  return (
    <div className="space-y-4">
      {/* Status Sub-tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
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
      ) : sortedInvoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t("no-invoices")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedInvoices.map((invoice, index) => {
            const isDueInvoice = index === 0 && selectedStatus === "PENDING";
            const isExtended = !!invoice.extendTo;
            const showPayment = isDueInvoice; // Payment only in PENDING tab for due invoice

            return (
              <div
                key={invoice._id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Icon and Invoice Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      isExtended
                        ? "bg-orange-100 dark:bg-orange-900/20"
                        : "bg-red-100 dark:bg-red-900/20"
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        isExtended
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-red-600 dark:text-red-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t("invoice-number", { number: invoice.ID })}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(invoice.date)}
                      </p>
                      {/* Show extended date if invoice has extendTo */}
                      {isExtended && (selectedStatus === "PENDING" || selectedStatus === "EXTENDED") && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                          {t("extended-to")}: {formatDate(invoice.extendTo!)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount and Menu */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {invoice.userAmount} {currency}
                    </span>

                    {/* Menu for due invoice only */}
                    {isDueInvoice && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        >
                          <DropdownMenuItem
                            onClick={() => handleExtendInvoice(invoice, index)}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                          >
                            <Calendar className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-white">{t("extend-invoice")}</span>
                          </DropdownMenuItem>
                          {invoice.userPdf && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleViewPdf(invoice.userPdf!)}
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                              >
                                <Eye className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-900 dark:text-white">{t("view-pdf")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDownloadPdf(invoice.userPdf!, invoice.ID)
                                }
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                              >
                                <Download className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-900 dark:text-white">{t("download-pdf")}</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Pay Now Button for due invoice only */}
                {isDueInvoice && (
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            {t("previous")}
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
            {t("page-info", { current: currentPage, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            {t("next")}
          </Button>
        </div>
      )}

      {/* Extend Invoice Dialog */}
      <ExtendInvoiceDialog
        invoiceId={extendInvoiceData?.id ?? null}
        open={!!extendInvoiceData}
        onOpenChange={(open) => !open && setExtendInvoiceData(null)}
        minDate={extendInvoiceData?.minDate}
        maxDate={extendInvoiceData?.maxDate}
      />

      {/* Payment Method Dialog */}
      <PaymentMethodDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onConfirm={handleConfirmPayment}
        amount={selectedInvoice?.userAmount}
        currency={currency}
      />
    </div>
  );
}
