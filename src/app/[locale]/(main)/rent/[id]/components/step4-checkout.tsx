"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { type Property, type PropertyService } from "@/lib/services/api/properties";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Home, Wallet, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useCountries } from "@/hooks/use-countries";
import { createRent } from "@/lib/services/api/rents";
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

  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Calculate rent amount based on property category
  const isTentBased = property.category === "camp" || property.category === "booth";
  const isHotelApartment = property.category === "hotelapartment";

  const rentAmount = useMemo(() => {
    if (isTentBased && selectedTents.length > 0) {
      // For camp/booth: sum all selected tents' prices * number of days
      const totalTentPrice = selectedTents.reduce((sum, tent) => sum + Number(tent.price || 0), 0);
      return totalTentPrice * selectedDates.length;
    } else if (isHotelApartment && selectedApartments.length > 0) {
      // For hotel apartments: sum all selected apartments' prices based on rent type
      const totalApartmentPrice = selectedApartments.reduce((sum, apartment) => {
        let price = 0;
        if (selectedRentType === "daily") {
          price = Number(apartment.dailyPrice || 0);
        } else if (selectedRentType === "weekly") {
          price = Number(apartment.weeklyPrice || 0);
        } else if (selectedRentType === "monthly") {
          price = Number(apartment.monthlyPrice || 0);
        }
        return sum + (price * (apartment.quantity || 1));
      }, 0);
      return totalApartmentPrice * selectedDates.length;
    } else {
      // For other properties: use property's daily/weekly/monthly price
      const rentAmountPerDay = selectedRentType === "daily"
        ? property?.dailyPrice
        : selectedRentType === "weekly"
        ? property.weeklyPrice
        : property?.monthlyPrice;
      return Number(rentAmountPerDay || 0) * selectedDates.length;
    }
  }, [isTentBased, isHotelApartment, selectedTents, selectedApartments, selectedDates.length, selectedRentType, property]);

  const insurance = useMemo(() => {
    if (isTentBased && selectedTents.length > 0) {
      // For camp/booth: sum all selected tents' insurance
      return selectedTents.reduce((sum, tent) => sum + Number(tent.insurance || 0), 0);
    } else if (isHotelApartment) {
      // For hotel apartments: use property's insurance price or 0
      return property?.insurancePrice || 0;
    } else {
      // For other properties: use property's insurance price
      return property?.insurancePrice || 0;
    }
  }, [isTentBased, isHotelApartment, selectedTents, property?.insurancePrice]);

  const servicesTotal = selectedServices.reduce(((a, b) => a + Number(b.price)), 0);
  const total = (rentAmount || 0) + (insurance || 0) + servicesTotal;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!property?._id) {
        toast.error("Property information is missing");
        return;
      }

      if (!selectedRentType) {
        toast.error("Please select a rent type");
        return;
      }

      if (selectedDates.length === 0 || !checkInDate || !checkOutDate) {
        toast.error("Please select dates");
        return;
      }

      // Format dates as MM/DD/YYYY
      const formattedStartDate = format(checkInDate, "MM/dd/yyyy");
      const formattedEndDate = format(checkOutDate, "MM/dd/yyyy");

      // Prepare payload
      const payload: any = {
        property: property._id,
        rentType: selectedRentType,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      };

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

      // Add time range for court properties
      if (property.category === "court" && timeRange && timeRange.from && timeRange.to) {
        payload.startTime = timeRange.from;
        payload.endTime = timeRange.to;
      }

      // Submit the rent request
      const response = await createRent(payload);

      if (response.status === "success" && response.data.PayUrl) {
        toast.success(response.message || "Payment session initiated successfully!");

        // Open payment URL in a new window
        const paymentWindow = window.open(
          response.data.PayUrl,
          "_blank",
          "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        if (!paymentWindow) {
          // If popup was blocked, show a message
          toast.error("Please allow popups to proceed with payment");
          // Fallback: navigate to the payment URL in the same tab
          window.location.href = response.data.PayUrl;
        } else {
          // Monitor the payment window
          const checkWindowClosed = setInterval(() => {
            if (paymentWindow.closed) {
              clearInterval(checkWindowClosed);
              // Redirect to property details after payment window is closed
              router.push(`/${locale}/properties/${property._id}`);
            }
          }, 1000);
        }
      } else {
        toast.error("Failed to initiate payment session");
      }
    } catch (error: any) {
      console.error("Error submitting rent:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to submit rent request";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDirectRent = property.rentManagement === "direct";

  return (
    <div className="space-y-6">
      {/* Rent Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t("rentDetails")}
        </h2>

        <div className="space-y-4">
          {/* Check-in & Check-out */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("checkInOut")}
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {checkInDate && checkOutDate
                  ? `${format(checkInDate, "dd MMM yyyy")} - ${format(
                    checkOutDate,
                    "dd MMM yyyy"
                  )}`
                  : t("notSelected")}
              </p>
            </div>
          </div>

          {/* Check-in Time */}
          {(property.checkInTime || property.checkOutTime) && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("checkInOutTime")}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {property.checkInTime && property.checkOutTime
                    ? `${property.checkInTime} - ${property.checkOutTime}`
                    : property.checkInTime || property.checkOutTime}
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
                {selectedRentType || t("notSelected")}
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
                  {timeRange.from} - {timeRange.to}
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
                {rentAmount} {currency}
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

      {/* Invoice Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t("invoiceDetails")}
        </h2>

        <div className="space-y-3">
          {/* Rent */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("rent")} ({selectedRentType})
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {rentAmount} {currency}
            </span>
          </div>

          {/* Insurance */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("insurance")}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {insurance} {currency}
            </span>
          </div>

          {/* Services */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("services")}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {servicesTotal} {currency}
            </span>
          </div>

          {/* Service breakdown (placeholder) */}
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
          {/* <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("commission")}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {commission} {tCommon("kwd")}
            </span>
          </div> */}

          {/* Tax */}
          {/* <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("tax")}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {tax} {tCommon("kwd")}
            </span>
          </div> */}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              {t("total")}
            </span>
            <span className="text-base font-bold text-main-500">
              {total} {tCommon("kwd")}
            </span>
          </div>
        </div>
      </div>

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
        onClick={handleSubmit}
        disabled={isSubmitting || selectedDates.length === 0 || !selectedRentType}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
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
