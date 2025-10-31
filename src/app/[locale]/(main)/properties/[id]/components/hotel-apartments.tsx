"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { Property } from "@/lib/services/api/properties";
import HeadTitle from "./head-title";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import Typography from "@/components/shared/typography";

interface HotelApartmentsProps {
  property: Property;
  currency?: string;
}

interface HotelApartment {
  _id?: string;
  name?: string;
  dailyPrice?: number | string;
  weeklyPrice?: number | string;
  monthlyPrice?: number | string;
  isDaily?: boolean;
  isWeekly?: boolean;
  isMonthly?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  capacity?: number;
  description?: string;
}

export default function HotelApartments({ property, currency = "KWD" }: HotelApartmentsProps) {
  const t = useTranslations("Properties.Details");
  const locale = useLocale();
  const [selectedApartment, setSelectedApartment] = useState<HotelApartment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApartmentClick = (apartment: HotelApartment) => {
    setSelectedApartment(apartment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedApartment(null);
    setIsModalOpen(false);
  };

  if (!property.apartments || property.apartments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="border-b border-gray-200 py-12 dark:border-gray-700">
        <HeadTitle text={t("apartments")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {property.apartments.map((apartment, index) => (
            <div
              key={index}
              onClick={() => handleApartmentClick(apartment)}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-primary dark:border-gray-700 dark:bg-gray-800"
            >
              <Typography variant="body-lg-medium" as="h3" className="font-bold mb-2">
                {apartment.name || `${t("apartment")} ${index + 1}`}
              </Typography>

              <div className="space-y-2 text-sm">
                {apartment.isDaily && apartment.dailyPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("daily-price")}</span>
                    <span className="font-semibold text-primary">{apartment.dailyPrice} {currency}</span>
                  </div>
                )}
                {apartment.isWeekly && apartment.weeklyPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("weekly-price")}</span>
                    <span className="font-semibold text-primary">{apartment.weeklyPrice} {currency}</span>
                  </div>
                )}
                {apartment.isMonthly && apartment.monthlyPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t("monthly-price")}</span>
                    <span className="font-semibold text-primary">{apartment.monthlyPrice} {currency}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                {apartment.bedrooms && (
                  <span>{apartment.bedrooms} {t("beds")}</span>
                )}
                {apartment.bathrooms && (
                  <span>{apartment.bathrooms} {t("baths")}</span>
                )}
                {apartment.area && (
                  <span>{apartment.area} m²</span>
                )}
                {apartment.capacity && (
                  <span>{t("capacity")}: {apartment.capacity}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apartment Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedApartment?.name || t("apartment-details")}
            </DialogTitle>
          </DialogHeader>

          {selectedApartment && (
            <div className="space-y-6 p-2">
              {/* Pricing */}
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <Typography variant="body-md" as="h4" className="font-semibold mb-3">
                  {t("pricing")}
                </Typography>
                <div className="space-y-2">
                  {selectedApartment.isDaily && selectedApartment.dailyPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t("daily-price")}</span>
                      <span className="font-bold text-primary">{selectedApartment.dailyPrice} {currency}</span>
                    </div>
                  )}
                  {selectedApartment.isWeekly && selectedApartment.weeklyPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t("weekly-price")}</span>
                      <span className="font-bold text-primary">{selectedApartment.weeklyPrice} {currency}</span>
                    </div>
                  )}
                  {selectedApartment.isMonthly && selectedApartment.monthlyPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t("monthly-price")}</span>
                      <span className="font-bold text-primary">{selectedApartment.monthlyPrice} {currency}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                {selectedApartment.bedrooms && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("bedrooms")}</span>
                    <p className="text-lg font-semibold">{selectedApartment.bedrooms}</p>
                  </div>
                )}
                {selectedApartment.bathrooms && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("bathrooms")}</span>
                    <p className="text-lg font-semibold">{selectedApartment.bathrooms}</p>
                  </div>
                )}
                {selectedApartment.area && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("area")}</span>
                    <p className="text-lg font-semibold">{selectedApartment.area} m²</p>
                  </div>
                )}
                {selectedApartment.capacity && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("capacity")}</span>
                    <p className="text-lg font-semibold">{selectedApartment.capacity}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedApartment.description && (
                <div>
                  <Typography variant="body-md" as="h4" className="font-semibold mb-2">
                    {t("description")}
                  </Typography>
                  <Typography variant="body-sm" as="p" className="text-gray-600 dark:text-gray-400">
                    {selectedApartment.description}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
