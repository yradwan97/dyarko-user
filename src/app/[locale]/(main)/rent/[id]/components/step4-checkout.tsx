"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { type Property, type PropertyService } from "@/lib/services/api/properties";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Home, Wallet, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useCountries } from "@/hooks/use-countries";
import { createRent, createRentRequest, type PriceDetails } from "@/lib/services/api/rents";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Step4CheckoutProps {
  property: Property;
  selectedRentType: string;
  selectedServices: PropertyService[];
  selectedDates: Date[];
  selectedTents: any[];
  selectedApartments?: any[];
  timeRange?: { from: string; to: string };
  agreedToTerms: {
    termsAndConditions: boolean;
    refundPolicy: boolean;
    contract: boolean;
    ownerRoles: boolean;
  };
  pickupLocation: { lat: number; lng: number } | null;
}

// Helper function to format time string (handles both ISO strings and simple time strings)
const formatTimeString = (timeStr: string): string => {
  if (!timeStr) return "";

  // Check if it's an ISO string
  if (timeStr.includes("T") || timeStr.includes("-")) {
    try {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch {
      // Fall through to return original string
    }
  }

  // Return as-is if it's already a formatted time string like "2:00 PM"
  return timeStr;
};

export default function Step4Checkout({
  property,
  selectedRentType,
  selectedServices,
  selectedDates,
  selectedTents,
  selectedApartments = [],
  timeRange,
  pickupLocation,
}: Step4CheckoutProps) {
  const t = useTranslations("Rent.Step4");
  const tCommon = useTranslations("General");
  const locale = useLocale();
  const router = useRouter();

  const isDirectRent = property.rentManagement === "direct";

  const [isLoading, setIsLoading] = useState(isDirectRent);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [priceDetails, setPriceDetails] = useState<PriceDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: countries } = useCountries();

  const currency = useMemo(() => {
    if (!property || !countries) return "KWD";
    const country = countries.find(c =>
      c.countryEn === property.country ||
      c.countryAr === property.country ||
      c.code === property.country
    );
    return country?.currency || "KWD";
  }, [property, countries]);

  // Calculate dates
  const checkInDate = useMemo(() => {
    if (selectedDates.length === 0) return null;
    return selectedDates.sort((a, b) => a.getTime() - b.getTime())[0];
  }, [selectedDates]);

  const checkOutDate = useMemo(() => {
    if (selectedDates.length === 0) return null;
    return selectedDates.sort((a, b) => a.getTime() - b.getTime())[
      selectedDates.length - 1
    ];
  }, [selectedDates]);

  // Property category flags for UI display
  const isTentBased = property.category === "camp" || property.category === "booth";
  const isHotelApartment = property.category === "hotelapartment";
  const isCourt = property.category === "court";

  // Build payload for API call
  const buildPayload = useMemo(() => {
    if (!property?._id || !selectedRentType || selectedDates.length === 0 || !checkInDate || !checkOutDate) {
      return null;
    }

    const payload: any = {
      property: property._id,
      rentType: selectedRentType,
    };

    // For courts, use MM/DD/YYYY HH:mm format with start of first slot and end of last slot
    if (property.category === "court" && timeRange && timeRange.from && timeRange.to) {
      const startDateTime = new Date(timeRange.from);
      const endDateTime = new Date(timeRange.to);
      payload.startDate = format(startDateTime, "MM/dd/yyyy HH:mm");
      payload.endDate = format(endDateTime, "MM/dd/yyyy HH:mm");
    } else {
      payload.startDate = format(checkInDate, "MM/dd/yyyy");
      payload.endDate = format(checkOutDate, "MM/dd/yyyy");
    }

    // Add services only if there are any selected
    if (selectedServices.length > 0) {
      payload.services = selectedServices.map((service) => service._id);
    }

    // Add pickup location for camper/movable properties
    if (property.category === "camper" && (property as any).type === "movable" && pickupLocation) {
      payload.lat = pickupLocation.lat.toString();
      payload.long = pickupLocation.lng.toString();
    }

    // Add selected tents for camp/booth properties
    if ((property.category === "camp" || property.category === "booth") && selectedTents.length > 0) {
      payload.tents = selectedTents.map((tent) => tent._id);
    }

    // Add selected apartments for hotel apartment properties
    if (property.category === "hotelapartment" && selectedApartments.length > 0) {
      payload.apartments = selectedApartments.map((apartment) => ({
        type: apartment.type || "apartment",
        units: apartment.quantity || 1,
      }));
    }

    return payload;
  }, [property, selectedRentType, selectedDates, checkInDate, checkOutDate, timeRange, selectedServices, pickupLocation, selectedTents, selectedApartments]);

  // Call createRent API on component mount for direct rent properties
  useEffect(() => {
    const fetchRentData = async () => {
      if (!isDirectRent || !buildPayload) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Calling createRent with payload:", buildPayload);
        const response = await createRent(buildPayload);
        console.log("createRent response:", response);

        if (response.status === "success" && response.data.PayUrl) {
          setPayUrl(response.data.PayUrl);
          setPriceDetails(response.data.priceDetails);
        } else {
          const errorMsg = "Failed to create rent";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (err: any) {
        console.error("Error creating rent:", err);
        const errorMessage = err?.response?.data?.message || "Failed to create rent";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentData();
  }, [isDirectRent, buildPayload]);

  // Handle payment button click - for direct rent, open PayURL in new tab and redirect
  const handlePayment = () => {
    if (!payUrl) return;

    // Open payment URL in a new tab
    window.open(payUrl, "_blank");

    // Redirect to my-real-estates with rent tab
    router.push(`/${locale}/user/my-real-estates?tab=rent`);
  };

  // Handle non-direct rent request submission
  const handleSubmit = async () => {
    if (!buildPayload) {
      toast.error(t("paymentError"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await createRentRequest(buildPayload);

      if (response.status === "success") {
        toast.success(t("requestSuccess"));
        router.push(`/${locale}/user/my-requests?tab=rent`);
      } else {
        toast.error(t("requestError"));
      }
    } catch (err: any) {
      console.error("Error submitting rent request:", err);
      const errorMessage = err?.response?.data?.message || t("requestError");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rent Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t("rentDetails")}
        </h2>

        <div className="space-y-4">
          {/* Check-in & Check-out / Date for Court */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isCourt ? t("date") : t("checkInOut")}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isCourt && checkInDate
                  ? format(checkInDate, "dd MMM yyyy", { locale: locale === "ar" ? ar : enUS })
                  : checkInDate && checkOutDate
                  ? `${format(checkInDate, "dd MMM yyyy", { locale: locale === "ar" ? ar : enUS })} - ${format(
                    checkOutDate,
                    "dd MMM yyyy",
                    { locale: locale === "ar" ? ar : enUS }
                  )}`
                  : t("notSelected")}
              </p>
            </div>
          </div>

          {/* Check-in Time */}
          {(property.checkInTime || property.checkOutTime) && !isCourt && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("checkInOutTime")}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {property.checkInTime && property.checkOutTime
                    ? `${formatTimeString(property.checkInTime)} - ${formatTimeString(property.checkOutTime)}`
                    : formatTimeString(property.checkInTime || property.checkOutTime || "") || "N/A"}
                </p>
              </div>
            </div>
          )}

          {/* Rent Type */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("rentType")}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {tCommon(`rent-types.${selectedRentType}`) || t("notSelected")}
              </p>
            </div>
          </div>

          {/* Time Range - Court only */}
          {property.category === "court" && timeRange && timeRange.from && timeRange.to && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("timeRange")}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatTimeString(timeRange.from)} - {formatTimeString(timeRange.to)}
                </p>
              </div>
            </div>
          )}

          {/* Rent Amount */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Wallet className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("rentAmount")}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {isDirectRent
                  ? (priceDetails ? `${priceDetails.rent} ${currency}` : "—")
                  : t("calculatedAtCheckout")}
              </p>
            </div>
          </div>

          {/* Selected Apartments - Hotel Apartment only */}
          {isHotelApartment && selectedApartments.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t("selectedApartments")}
              </p>
              <div className="space-y-1">
                {selectedApartments.map((apartment, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {apartment.title || `${apartment.type || 'Apartment'}`}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      x{apartment.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details - Only show for direct rent */}
      {isDirectRent && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t("invoiceDetails")}
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">{tCommon("loading")}</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : priceDetails ? (
            <div className="space-y-3">
              {/* Rent */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("rent")} ({tCommon(`rent-types.${selectedRentType}`)})
                  {isCourt && timeRange && timeRange.from && timeRange.to && (
                    <> - {Math.ceil((new Date(timeRange.to).getTime() - new Date(timeRange.from).getTime()) / (1000 * 60 * 60))} {t("hours") || "hours"}</>
                  )}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {priceDetails.rent} {currency}
                </span>
              </div>

              {/* Insurance */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("insurance")}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {priceDetails.insurance} {currency}
                </span>
              </div>

              {/* Services */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("services")}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {priceDetails.services} {currency}
                </span>
              </div>

              {/* Service breakdown */}
              {selectedServices.length > 0 && (
                selectedServices.map((service, index) => (
                  <div key={index} className="pl-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {locale === "ar" ? service.nameAr : service.nameEn}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                         {service.price} {currency}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* Commission */}
              {priceDetails.commission > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("commission")}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {priceDetails.commission} {currency}
                  </span>
                </div>
              )}

              {/* Tax */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("tax")}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {priceDetails.tax} {currency}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("total")}
                </span>
                <span className="text-base font-bold text-main-500">
                  {priceDetails.totalAmount} {currency}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Notes */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <span className="font-medium">{t("note")}:</span> {t("securityDepositNote")}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
          <span className="font-medium">{t("note")}:</span> {t("commissionNote")}
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={isDirectRent ? handlePayment : handleSubmit}
        disabled={isDirectRent ? (isLoading || !payUrl) : (isLoading || !buildPayload)}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {tCommon("loading")}
          </>
        ) : (
          isDirectRent ? t("completePurchase") : t("sendRequest")
        )}
      </Button>
    </div>
  );
}
