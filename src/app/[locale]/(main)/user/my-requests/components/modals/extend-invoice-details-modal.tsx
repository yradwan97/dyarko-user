"use client";

import { useState } from "react";
import { DollarSign, Phone, Calendar } from "lucide-react";
import Typography from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { type BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";
import PaymentMethodDialog from "@/components/dialogs/payment-method-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExtendInvoiceDetailsModalProps extends BaseModalProps {
  onPayInvoice?: (invoiceId: string, paymentMethod: string) => Promise<void>;
  isPaymentPending?: boolean;
}

export function ExtendInvoiceDetailsModal(props: ExtendInvoiceDetailsModalProps) {
  const { onPayInvoice, isPaymentPending, ...baseProps } = props;
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<{ id: string; amount: number } | null>(null);

  const handlePayNowClick = (invoiceId: string, amount: number) => {
    setInvoiceData({ id: invoiceId, amount });
    setPaymentDialogOpen(true);
  };

  const handlePaymentMethodSelect = async (paymentMethod: string) => {
    setSelectedPaymentMethod(paymentMethod);
    setPaymentDialogOpen(false);
    setConfirmationDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!invoiceData || !selectedPaymentMethod || !onPayInvoice) return;

    try {
      await onPayInvoice(invoiceData.id, selectedPaymentMethod);
      setConfirmationDialogOpen(false);
      setInvoiceData(null);
      setSelectedPaymentMethod(null);
    } catch (error) {
      // Error handling is done in parent component
      setConfirmationDialogOpen(false);
    }
  };

  return (
    <BaseDetailsModal {...baseProps} requestType="extend-invoices">
      {({ request, locale, t, formatDate, currency }) => (
        <>
          <div className="space-y-4">
            {request.invoice && (
              <>
                {request.invoice.userAmount && (
                  <div className={cn("flex items-center gap-2 text-gray-600")}>
                    <DollarSign className="h-4 w-4 shrink-0" />
                    <div className={cn("flex items-center")}>
                      <Typography variant="body-sm" as="span" className="font-medium">
                        {t("invoice-amount")}:
                      </Typography>
                      <Typography variant="body-sm" as="span" className={cn(locale === "ar" ? "mr-2" : "ml-2")}>
                        {request.invoice.userAmount} {currency}
                      </Typography>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 my-5">
                  {request.invoice.date && (
                    <div className={cn("flex items-center gap-2 text-gray-600")}>
                      <Calendar className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className={cn(locale === "ar" && "text-right")}>
                        <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                          {t("invoice-date")}:
                        </Typography>
                        <Typography variant="body-sm" as="p" className="text-gray-600">
                          {formatDate(request.invoice.date)}
                        </Typography>
                      </div>
                    </div>
                  )}
                  {request.extendTo && (
                    <div className={cn("flex items-center gap-2 text-gray-600")}>
                      <Calendar className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className={cn(locale === "ar" && "text-right")}>
                        <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                          {t("extend-invoice-date")}:
                        </Typography>
                        <Typography variant="body-sm" as="p" className="text-gray-600">
                          {formatDate(request.extendTo)}
                        </Typography>
                      </div>
                    </div>
                  )}
                </div>

                {request.owner?.phoneNumber && (
                  <div className={cn("flex items-center gap-2 text-gray-600")}>
                    <Phone className="h-4 w-4 shrink-0" />
                    <div className={cn("flex items-center")}>
                      <Typography variant="body-sm" as="span" className="font-medium">
                        {t("phone-number")}:
                      </Typography>
                      <Typography variant="body-sm" as="span" className={cn(locale === "ar" ? "mr-2" : "ml-2")}>
                        {request.owner.phoneNumber}
                      </Typography>
                    </div>
                  </div>
                )}
              </>
            )}

            {request.ownerComment && (
              <div className={cn("p-3 bg-gray-50 border-gray-200 rounded", locale === "ar" ? "border-r-4" : "border-l-4")}>
                <Typography variant="body-sm" as="p" className="font-medium text-gray-700 mb-1">
                  {t("comment")}:
                </Typography>
                <Typography variant="body-sm" as="p" className="text-gray-600">
                  {request.ownerComment}
                </Typography>
              </div>
            )}
          </div>

          {/* Pay Now button for rejected requests */}
          {request.status?.toLowerCase() === "rejected" && request.invoice?._id && (
            <Button
              variant="default"
              className="w-full mt-6 bg-main-600 text-white hover:bg-main-700"
              onClick={() => handlePayNowClick(request.invoice._id, request.invoice.userAmount || request.invoice.amount)}
              disabled={isPaymentPending}
            >
              {isPaymentPending ? <Spinner className="h-4 w-4" /> : t("pay-now")}
            </Button>
          )}

          {/* Payment Method Dialog */}
          <PaymentMethodDialog
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            onConfirm={handlePaymentMethodSelect}
            amount={invoiceData?.amount}
            currency={currency}
          />

          {/* Payment Confirmation Dialog */}
          <AlertDialog
            open={confirmationDialogOpen}
            onOpenChange={(open) => {
              if (!isPaymentPending) {
                setConfirmationDialogOpen(open);
                if (!open) {
                  setSelectedPaymentMethod(null);
                }
              }
            }}
          >
            <AlertDialogContent className="bg-white dark:bg-gray-950">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 dark:text-white">
                  {t("payment-confirmation-title")}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  {t("payment-confirmation-description", {
                    amount: invoiceData?.amount || 0,
                    currency,
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  disabled={isPaymentPending}
                  className="text-gray-900 dark:text-white"
                >
                  {t("cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmPayment}
                  disabled={isPaymentPending}
                  className="bg-main-600 hover:bg-main-700 text-white"
                >
                  {isPaymentPending ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    t("confirm-payment")
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </BaseDetailsModal>
  );
}
