"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { format } from "date-fns";
import { MapPin, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Rent } from "@/lib/services/api/rents";
import { useCountryCurrency } from "@/hooks/use-country-currency";

interface RentCardProps {
  rent: Rent;
  onClick: () => void;
}

export default function RentCard({ rent, onClick }: RentCardProps) {
  const t = useTranslations("User.MyRealEstates.RentCard");
  const tModal = useTranslations("User.MyRealEstates.RentDetailsModal");
  const tCategories = useTranslations("General.Categories");
  const locale = useLocale();
  const { property, status, startDate, endDate, amount } = rent;
  const currency = useCountryCurrency(property.country);

  const formatDateLong = (date: string) => {
    return format(new Date(date), "EEE, dd MMM yyyy");
  };

  const getRentStatus = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const normalizedStatus = status.toUpperCase();

    // Check if contract is terminated/cancelled
    if (normalizedStatus === "CANCELLED" || normalizedStatus === "TERMINATED") {
      return {
        text: `${t("contractTerminated")}`,
        color: "text-secondary-500 font-semibold",
        bulletColor: "text-secondary-500",
      };
    }

    // Check if rent has ended
    if (end < today) {
      return {
        text: `${t("rentEnded")}`,
        color: "text-steelBlue-400 font-semibold",
        bulletColor: "text-steelBlue-400",
      };
    }

    // Check if rent is upcoming
    if (start > today) {
      return {
        text: locale === "ar" ? `${formatDateLong(startDate)} :${t("upcomingDue")}` : `${t("upcomingDue")}: ${formatDateLong(startDate)}`,
        color: "text-main-600 font-semibold",
        bulletColor: "text-green-600",
      };
    }

    // Default: show status from API
    return {
      text: `${tModal(`status.${status.toLowerCase()}`)}`,
      color: getStatusColor(status),
      bulletColor: getStatusColor(status),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "text-green-600 font-semibold";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 font-semibold";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 font-semibold";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 font-semibold";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 font-semibold";
    }
  };

  const rentStatus = getRentStatus();

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg dark:hover:shadow-gray-800/50 p-0"
      onClick={onClick}
    >
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800">
        <Image
          src={property.image || "/no-apartment.png"}
          alt={property.title}
          fill
          className="object-cover"
        />
      </div>

      <CardContent className="p-4 space-y-3">
        <div className={cn(locale === "ar" && "text-right")}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {locale === "ar" ? `${property.code} :${t("code")}` : `${t("code")}: ${property.code}`}
          </p>
        </div>

        <div className={cn("space-y-2 text-sm", locale === "ar" && "text-right")}>
          <h3 className="font-semibold text-base line-clamp-2 text-main-600 dark:text-white">
              {property.title}
            </h3>
          <div className={cn("flex items-center gap-2 text-gray-600 dark:text-gray-400", locale === "ar" && "flex-row-reverse")}>
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1 capitalize">
              {property.city}, {property.country}
            </span>
          </div>

          <div className="space-y-1">
            <div className={`flex gap-2 flex-row-reverse ${rentStatus.color}`}>
              {rentStatus.bulletColor ? (
                <>
                  <span className={rentStatus.bulletColor}>• </span>
                  {rentStatus.text}
                </>
              ) : (
                rentStatus.text
              )}
            </div>
          </div>

          {amount && (
            <div className={cn("flex items-center gap-2 text-gray-600 dark:text-gray-400", locale === "ar" && "flex-row-reverse")}>
              <DollarSign className="h-4 w-4 shrink-0" />
              <span className="font-medium">
                {amount} {currency}
              </span>
            </div>
          )}
        </div>

        <div className={cn("pt-2 border-t border-gray-200 dark:border-gray-700", locale === "ar" && "text-right")}>
          <div className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
            {tCategories(property.category)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
