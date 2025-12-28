"use client";

import { useState, useMemo } from "react";
import { Calendar, DollarSign, Phone, User, Wallet, FileText, MessageSquare, Building, Tent } from "lucide-react";
import Typography from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";
import PaymentMethodDialog from "@/components/dialogs/payment-method-dialog";
import { proceedRentRequest, ProceedRentRequestPayload } from "@/lib/services/api/rents";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRequestDetails } from "@/hooks/use-request-details";
import { Textarea } from "@/components/ui/textarea";

export function RentDetailsModal(props: BaseModalProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const router = useRouter();

  // Fetch request data at top level to avoid conditional hook calls
  const { data } = useRequestDetails(props.endpoint || "", props.requestId || null);
  const request = data?.data;
  const property = data?.data?.property;

  // Calculate invoice amounts at top level
  const rentAmount = useMemo(() => {
    if (!property || !request?.rentType) return 0;

    const rentType = request.rentType.toLowerCase();
     if (!!request.priceDetails) {
      return Number(request.priceDetails.rent || 0);
    } else if (rentType === "daily") {
      return Number(property.dailyPrice || 0);
    } else if (rentType === "weekly") {
      return Number(property.weeklyPrice || 0);
    } else if (rentType === "monthly") {
      return Number(property.monthlyPrice || 0);
    } 
    return 0;
  }, [property, request?.rentType, request?.priceDetails]);

  const insurance = useMemo(() => {
    return Number(request?.priceDetails?.insurance || 0);
  }, [request]);

  const servicesTotal = useMemo(() => {
    if (!request?.services || request.services.length === 0) return 0;
    return request.services.reduce((sum: number, service: any) => {
      return sum + Number(service.price || 0);
    }, 0);
  }, [request?.services]);

  const tax = useMemo(() => {
    return Number(request?.priceDetails?.tax || 0);
  }, [request]);

  const total = useMemo(() => {
    return rentAmount + insurance + servicesTotal + (Number(request?.priceDetails?.commission) || 0) + tax;
  }, [request, rentAmount, insurance, servicesTotal, tax]);

  // Payment handler at top level
  const handlePayment = async (paymentMethod: string, request: any, locale: string) => {
    try {
      // Prepare payload similar to step4-checkout.tsx
      const payload: ProceedRentRequestPayload = {
        request: request._id,
        paymentMethod
      };

      // Call createRent API
      const response = await proceedRentRequest(payload);

      if (response.status === "success" && response.data.PayUrl) {
        toast.success(response.message || "Payment session initiated successfully!");

        // Open payment URL in a new window
        const paymentWindow = window.open(
          response.data.PayUrl,
          "_blank",
          "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        if (!paymentWindow) {
          toast.error("Please allow popups to proceed with payment");
          window.location.href = response.data.PayUrl;
        } else {
          const checkWindowClosed = setInterval(() => {
            if (paymentWindow.closed) {
              clearInterval(checkWindowClosed);
              props.onClose();
              router.push(`/${locale}/user/my-requests`);
            }
          }, 1000);
        }
      } else {
        toast.error("Failed to initiate payment session");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      const errorMessage = error?.response?.data?.message || "Failed to process payment";
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <BaseDetailsModal {...props} requestType="rent">
      {({ request, locale, t, formatDate, currency, property }) => {
        // Get localized rent type
        const getLocalizedRentType = (rentType: string) => {
          const key = rentType?.toLowerCase();
          return t(`rent-types.${key}`) || rentType;
        };

        return (
          <>
            <div className="space-y-4">
              {/* Apartments */}
              {request.apartments && request.apartments.length > 0 && (
                <div className="space-y-3">
                  <div className={cn("flex items-center gap-2", locale === "ar" && "flex-row-reverse")}>
                    <Building className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                      {t("apartments")} ({request.apartments.reduce((sum: number, apt: { units: number }) => sum + apt.units, 0)})
                    </Typography>
                  </div>
                  <div className="space-y-2">
                    {request.apartments.map((apt: { type: string; units: number }, index: number) => {
                      const apartmentDetails = property?.apartments?.find(
                        (a: { type: string; title: string; capacity: number; bedrooms: number; bathrooms: number; dailyPrice: number; weeklyPrice: number; monthlyPrice: number }) => a.type === apt.type
                      );
                      return (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className={cn("flex items-center justify-between mb-2", locale === "ar" && "flex-row-reverse")}>
                            <Typography variant="body-md-bold" as="span" className="font-semibold text-gray-900 dark:text-white">
                              {apartmentDetails?.title || apt.type}
                            </Typography>
                            <span className="px-2 py-0.5 bg-main-100 dark:bg-main-900 text-main-600 dark:text-main-400 text-xs rounded-full">
                              {apt.units} {apt.units === 1 ? t("unit") : t("units")}
                            </span>
                          </div>
                          {apartmentDetails && (
                            <div className={cn("grid grid-cols-3 gap-2 text-sm", locale === "ar" && "text-right")}>
                              <div>
                                <Typography variant="body-sm" as="span" className="text-gray-500 dark:text-gray-400">
                                  {t("capacity")}:
                                </Typography>
                                <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white ms-1">
                                  {apartmentDetails.capacity}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="body-sm" as="span" className="text-gray-500 dark:text-gray-400">
                                  {t("bedrooms")}:
                                </Typography>
                                <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white ms-1">
                                  {apartmentDetails.bedrooms}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="body-sm" as="span" className="text-gray-500 dark:text-gray-400">
                                  {t("bathrooms")}:
                                </Typography>
                                <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white ms-1">
                                  {apartmentDetails.bathrooms}
                                </Typography>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tents/Booths */}
              {request.tents && request.tents.length > 0 && property?.groups && (
                <div className="space-y-3">
                  <div className={cn("flex items-center gap-2", locale === "ar" && "flex-row-reverse")}>
                    <Tent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                      {t("tents")} ({request.tents.length})
                    </Typography>
                  </div>
                  <div className="space-y-2">
                    {request.tents.map((tentId: number) => {
                      const group = property.groups.find((g: { ids: number[]; color: string; capacity: number; price: number; insurance: number }) =>
                        g.ids.includes(tentId)
                      );
                      return (
                        <div
                          key={tentId}
                          className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className={cn("flex items-center justify-between mb-2", locale === "ar" && "flex-row-reverse")}>
                            <div className={cn("flex items-center gap-2", locale === "ar" && "flex-row-reverse")}>
                              {group && (
                                <span
                                  className="w-4 h-4 rounded-full shrink-0"
                                  style={{ backgroundColor: group.color }}
                                />
                              )}
                              <Typography variant="body-md-bold" as="span" className="font-semibold text-gray-900 dark:text-white">
                                {t("tent")} #{tentId}
                              </Typography>
                            </div>
                          </div>
                          {group && (
                            <div className={cn("grid grid-cols-3 gap-2 text-sm", locale === "ar" && "text-right")}>
                              <div>
                                <Typography variant="body-sm" as="span" className="text-gray-500 dark:text-gray-400">
                                  {t("capacity")}:
                                </Typography>
                                <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white ms-1">
                                  {group.capacity}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="body-sm" as="span" className="text-gray-500 dark:text-gray-400">
                                  {t("price")}:
                                </Typography>
                                <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white ms-1">
                                  {group.price} {currency}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="body-sm" as="span" className="text-gray-500 dark:text-gray-400">
                                  {t("insurance")}:
                                </Typography>
                                <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white ms-1">
                                  {group.insurance} {currency}
                                </Typography>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Check-in & Check-out Date */}
                  <div className={cn("flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg", locale === "ar" && "flex-row-reverse")}>
                    <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div className={cn("flex-1", locale === "ar" && "text-right")}>
                      <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                        {t("check-in-out-date")}
                      </Typography>
                      <Typography variant="body-sm" as="p" className="font-medium text-gray-900 dark:text-white">
                        {formatDate(request.startDate)} : {formatDate(request.endDate)}
                      </Typography>
                    </div>
                  </div>

                  {/* Rent Period and Rent Type */}
                  <div className="grid grid-cols-2 gap-3">

                    <div className={cn("flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg", locale === "ar" && "flex-row-reverse")}>
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div className={cn("flex-1", locale === "ar" && "text-right")}>
                        <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                          {t("rent-type")}
                        </Typography>
                        <Typography variant="body-sm" as="p" className="font-medium text-gray-900 dark:text-white">
                          {getLocalizedRentType(request.rentType)}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Rent Amount */}
                  <div className={cn("flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg", locale === "ar" && "flex-row-reverse")}>
                    <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div className={cn("flex-1", locale === "ar" && "text-right")}>
                      <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                        {t("rent-amount")}
                      </Typography>
                      <Typography variant="body-sm" as="p" className="font-semibold text-gray-900 dark:text-white">
                        {rentAmount} {currency}
                      </Typography>
                    </div>
                  </div>

                  {/* Phone Number */}
                  {(request.mobileNumber || request.user?.phoneNumber) && (
                    <div className={cn("flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg", locale === "ar" && "flex-row-reverse")}>
                      <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div className={cn("flex-1", locale === "ar" && "text-right")}>
                        <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                          {t("phone-number")}
                        </Typography>
                        <Typography variant="body-sm" as="p" className="font-medium text-gray-900 dark:text-white">
                          {request.mobileNumber || request.user?.phoneNumber}
                        </Typography>
                      </div>
                    </div>
                  )}
              {/* Rent Request Details - shown for approved status */}
              {request.status?.toLowerCase() === "confirmed" && (
                <>

                  {/* Invoice Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
                    <Typography variant="body-md-bold" as="h3" className="font-semibold mb-4">
                      {t("invoice-details") || "Invoice Details"}
                    </Typography>

                    <div className="space-y-3">
                      {/* Rent */}
                      <div className={cn("flex justify-between items-center", locale === "ar" && "flex-row-reverse")}>
                        <Typography variant="body-sm" as="span" className="text-gray-600 dark:text-gray-400">
                          {t("rent")} ({getLocalizedRentType(request.rentType)})
                        </Typography>
                        <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white">
                          {rentAmount} {currency}
                        </Typography>
                      </div>

                      {/* Insurance */}
                      <div className={cn("flex justify-between items-center", locale === "ar" && "flex-row-reverse")}>
                        <Typography variant="body-sm" as="span" className="text-gray-600 dark:text-gray-400">
                          {t("insurance")} {insurance === 0 && `(${t("credit")} ${t("at")} ${t("dyarko")})`}
                        </Typography>
                        <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white">
                          {insurance} {currency}
                        </Typography>
                      </div>

                      {/* Services */}
                      <div className={cn("flex justify-between items-center", locale === "ar" && "flex-row-reverse")}>
                        <Typography variant="body-sm" as="span" className="text-gray-600 dark:text-gray-400">
                          {t("services")}
                        </Typography>
                        <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white">
                          {servicesTotal} {currency}
                        </Typography>
                      </div>

                      {/* Service breakdown */}
                      {request.services && request.services.length > 0 && (
                        <div className={cn("pl-4 space-y-2", locale === "ar" && "pr-4 pl-0")}>
                          {request.services.map((service: any, index: number) => (
                            <div key={index} className={cn("flex justify-between items-center", locale === "ar" && "flex-row-reverse")}>
                              <Typography variant="body-sm" as="span" className="text-gray-500 dark:text-gray-400">
                                {locale === "ar" ? service.nameAr : service.nameEn}
                              </Typography>
                              <Typography variant="body-sm" as="span" className="text-gray-600 dark:text-gray-400">
                                {service.price} {currency}
                              </Typography>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Commission */}
                      {request?.priceDetails?.commission && <div className={cn("flex justify-between items-center", locale === "ar" && "flex-row-reverse")}>
                        <Typography variant="body-sm" as="span" className="text-gray-600 dark:text-gray-400">
                          {t("commission") || "Commission"}
                        </Typography>
                        <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white">
                          {request?.priceDetails?.commission} {currency}
                        </Typography>
                      </div>}

                      {/* Tax */}
                      <div className={cn("flex justify-between items-center", locale === "ar" && "flex-row-reverse")}>
                        <Typography variant="body-sm" as="span" className="text-gray-600 dark:text-gray-400">
                          {t("tax")}
                        </Typography>
                        <Typography variant="body-sm" as="span" className="font-medium text-gray-900 dark:text-white">
                          {tax} {currency}
                        </Typography>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                      {/* Total */}
                      <div className={cn("flex justify-between items-center", locale === "ar" && "flex-row-reverse")}>
                        <Typography variant="body-md-bold" as="span" className="font-semibold text-gray-900 dark:text-white">
                          {t("total")}
                        </Typography>
                        <Typography variant="body-md-bold" as="span" className="font-bold text-main-500">
                          {total} {currency}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={cn("flex gap-3 mt-6", locale === "ar" && "flex-row-reverse")}>
                    <Button
                      variant="default"
                      className="flex-1 bg-main-600 text-white hover:bg-main-700"
                      onClick={() => setShowPaymentDialog(true)}
                    >
                      {t("complete")}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={props.onClose}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </>
              )}
              {request.status?.toLowerCase() === "rejected" && request.ownerComment && (
                <div className={cn("flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg", locale === "ar" && "flex-row-reverse")}>
                      <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div className={cn("flex-1", locale === "ar" && "text-right")}>
                        <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 mb-1">
                          {t("owner-comment")}
                        </Typography>
                        <Textarea rows={3} value={request.ownerComment} disabled />
                      </div>
                    </div>
              )}
            </div>

            {/* Payment Method Dialog */}
            <PaymentMethodDialog
              open={showPaymentDialog}
              onOpenChange={setShowPaymentDialog}
              onConfirm={(paymentMethod: string) => handlePayment(paymentMethod, request, locale)}
              amount={total}
              currency={currency}
            />
          </>
        );
      }}
    </BaseDetailsModal>
  );
}
