"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { type Property } from "@/lib/services/api/properties";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Home, Users, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountries } from "@/hooks/use-countries";

interface Apartment {
  _id?: string;
  type?: string;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  title?: string;
  description?: string;
  isDaily?: boolean;
  dailyPrice?: number;
  isWeekly?: boolean;
  weeklyPrice?: number;
  isMonthly?: boolean;
  monthlyPrice?: number;
  numberOfUnits?: number;
}

interface SelectedApartment extends Apartment {
  quantity: number;
}

interface Step25SelectApartmentsProps {
  property: Property;
  selectedRentType: string;
  selectedApartments: SelectedApartment[];
  setSelectedApartments: (apartments: SelectedApartment[]) => void;
  onNext: () => void;
}

export default function Step25SelectApartments({
  property,
  selectedRentType,
  selectedApartments,
  setSelectedApartments,
  onNext,
}: Step25SelectApartmentsProps) {
  const locale = useLocale();
  const t = useTranslations("Rent.Step2_5");
  const tCommon = useTranslations("General");
  const { data: countries } = useCountries();

  // Filter apartments based on selected rent type
  const allApartments = (property.apartments || []) as Apartment[];
  const apartments = useMemo(() => {
    if (!selectedRentType) return allApartments;

    return allApartments.filter((apartment) => {
      switch (selectedRentType.toLowerCase()) {
        case "daily":
          return apartment.isDaily === true;
        case "weekly":
          return apartment.isWeekly === true;
        case "monthly":
          return apartment.isMonthly === true;
        default:
          return true;
      }
    });
  }, [allApartments, selectedRentType]);

  // Get currency based on property country
  const currency = useMemo(() => {
    if (!property || !countries) return "KWD";
    const country = countries.find(c =>
      c.countryEn === property.country ||
      c.countryAr === property.country ||
      c.code === property.country
    );
    return country?.currency || "KWD";
  }, [property, countries]);

  const getApartmentQuantity = (apartment: Apartment) => {
    const selected = selectedApartments.find(
      (a) => (a._id || a.title) === (apartment._id || apartment.title)
    );
    return selected?.quantity || 0;
  };

  const updateQuantity = (apartment: Apartment, delta: number) => {
    const currentQuantity = getApartmentQuantity(apartment);
    const maxUnits = apartment.numberOfUnits || Infinity;
    const newQuantity = Math.max(0, Math.min(maxUnits, currentQuantity + delta));

    if (newQuantity === 0) {
      // Remove apartment
      setSelectedApartments(
        selectedApartments.filter(
          (a) => (a._id || a.title) !== (apartment._id || apartment.title)
        )
      );
    } else {
      const existing = selectedApartments.find(
        (a) => (a._id || a.title) === (apartment._id || apartment.title)
      );

      if (existing) {
        // Update quantity
        setSelectedApartments(
          selectedApartments.map((a) =>
            (a._id || a.title) === (apartment._id || apartment.title)
              ? { ...a, quantity: newQuantity } as SelectedApartment
              : a
          )
        );
      } else {
        // Add new apartment
        setSelectedApartments([
          ...selectedApartments,
          { ...apartment, quantity: newQuantity } as SelectedApartment,
        ]);
      }
    }
  };

  const selectApartment = (apartment: Apartment) => {
    const currentQuantity = getApartmentQuantity(apartment);
    if (currentQuantity === 0) {
      updateQuantity(apartment, 1);
    }
  };

  const getUnitTypeLabel = (type?: string) => {
    if (!type) return t("apartment");
    const typeMap: Record<string, string> = {
      apartment: t("apartment"),
      duplex: t("duplex"),
      suite: t("suite"),
      studio: t("studio"),
    };
    return typeMap[type.toLowerCase()] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t("select-type")}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("select-rooms-description")}
        </p>
      </div>

      {/* Apartments List */}
      <div className="space-y-4">
        {apartments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t("no-apartments-available")}
            </p>
          </div>
        ) : (
          apartments.map((apartment, index) => {
          const quantity = getApartmentQuantity(apartment);
          const apartmentId = apartment._id || apartment.title || `apartment-${index}`;

          return (
            <div
              key={apartmentId}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              {/* Apartment Title */}
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                {apartment.title || `${t("apartment")} ${index + 1}`}
              </h3>

              {/* Icons Row */}
              <div className="flex items-center gap-6 mb-4">
                {apartment.bedrooms && (
                  <div className="flex flex-col items-center gap-1">
                    <Bed className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {t("bedrooms")}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t("bed")} {apartment.bedrooms}
                    </span>
                  </div>
                )}
                {apartment.bathrooms && (
                  <div className="flex flex-col items-center gap-1">
                    <Bath className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {t("bathrooms")}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t("bath")} {apartment.bathrooms}
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-center gap-1">
                  <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {t("unit-type")}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getUnitTypeLabel(apartment.type)}
                  </span>
                </div>
              </div>

              {/* Capacity */}
              {apartment.capacity && (
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {apartment.capacity} {t("person")}
                  </span>
                </div>
              )}

              {/* Prices */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {apartment.isDaily && apartment.dailyPrice && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {apartment.dailyPrice} {currency}/{t("day")}
                    </span>
                  </div>
                )}
                {apartment.isWeekly && apartment.weeklyPrice && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {apartment.weeklyPrice} {currency}/{t("week")}
                    </span>
                  </div>
                )}
                {apartment.isMonthly && apartment.monthlyPrice && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {apartment.monthlyPrice} {currency}/{t("month")}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {apartment.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {apartment.description}
                </p>
              )}

              {/* Quantity and Select */}
              <div className="flex items-center justify-between gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("quantity")}:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(apartment, -1)}
                      disabled={quantity === 0}
                      className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(apartment, 1)}
                      disabled={apartment.numberOfUnits !== undefined && quantity >= apartment.numberOfUnits}
                      className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  {apartment.numberOfUnits !== undefined && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t("max")}: {apartment.numberOfUnits}
                    </span>
                  )}
                </div>

                {/* Select Button */}
                <Button
                  onClick={() => selectApartment(apartment)}
                  disabled={quantity > 0}
                  className={cn(
                    "px-8 h-10 font-semibold rounded-lg transition-all",
                    quantity > 0
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900"
                  )}
                >
                  {t("select")}
                </Button>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Next Button */}
      <Button
        onClick={onNext}
        disabled={selectedApartments.length === 0}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("next") || "Next"}
      </Button>
    </div>
  );
}
