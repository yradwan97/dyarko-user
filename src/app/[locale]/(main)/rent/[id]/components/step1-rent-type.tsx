"use client";

import { useLocale, useTranslations } from "next-intl";
import { type Property, type PropertyService } from "@/lib/services/api/properties";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step1RentTypeProps {
  property: Property;
  selectedRentType: string;
  setSelectedRentType: (type: string) => void;
  selectedServices: PropertyService[];
  setSelectedServices: (services: PropertyService[]) => void;
  onNext: () => void;
}

export default function Step1RentType({
  property,
  selectedRentType,
  setSelectedRentType,
  selectedServices,
  setSelectedServices,
  onNext,
}: Step1RentTypeProps) {
  const locale = useLocale();
  const t = useTranslations("Rent.Step1");

  const rentTypes = [];
  if (property.isDaily) rentTypes.push({ key: "daily", label: t("daily") });
  if (property.isWeekly) rentTypes.push({ key: "weekly", label: t("weekly") });
  if (property.isMonthly) rentTypes.push({ key: "monthly", label: t("monthly") });
  if (property.isWeekdays) rentTypes.push({ key: "weekdays", label: t("weekdays") });
  if (property.isHolidays) rentTypes.push({ key: "holidays", label: t("holidays") });

  const toggleService = (service: PropertyService) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((srv) => srv._id !== service._id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const getServiceName = (service: PropertyService) => {
    if (typeof service === "string") return service;
    return locale === "ar" ? service.nameAr : service.nameEn;
  };

  const getServicePrice = (service: PropertyService) => {
    if (typeof service === "object" && service.price) {
      return service.price;
    }
    return null;
  };

  const getServiceId = (service: PropertyService, index: number) => {
    if (typeof service === "object" && service._id) {
      return service._id;
    }
    return `service-${index}`;
  };

  return (
    <div className="space-y-6">
      {/* Rent Type Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("rentType")}
        </h2>
        <div className="space-y-3">
          {rentTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setSelectedRentType(type.key)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all",
                selectedRentType === type.key
                  ? "border-main-500 bg-main-50 dark:bg-main-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {type.label}
              </span>
              {selectedRentType === type.key && (
                <div className="w-6 h-6 rounded-full bg-main-500 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>
              )}
              {selectedRentType !== type.key && (
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Extra Services Section */}
      {property.services && property.services.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("extraService")}
          </h2>
          <div className="space-y-3">
            {property.services.map((service, index) => {
              const serviceId = getServiceId(service, index);
              const serviceName = getServiceName(service);
              const servicePrice = getServicePrice(service);
              const isSelected = selectedServices.find((srv) => srv._id === serviceId);

              return (
                <button
                  key={serviceId}
                  onClick={() => toggleService(service)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all",
                    isSelected
                      ? "border-main-500 bg-main-50 dark:bg-main-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {serviceName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {servicePrice && (
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {servicePrice} {t("kwd")}
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-md bg-main-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {!isSelected && (
                      <div className="w-6 h-6 rounded-md border-2 border-gray-300 dark:border-gray-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Button */}
      <Button
        onClick={onNext}
        disabled={!selectedRentType}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl"
      >
        {t("next")}
      </Button>
    </div>
  );
}
