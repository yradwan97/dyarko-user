"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { format } from "date-fns";
import { MapPin, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
        text: t("contractTerminated"),
        textColor: "text-secondary-500 font-semibold",
      };
    }

    // Check if rent has ended
    if (end < today) {
      return {
        text: t("rentEnded"),
        textColor: "text-gray-500 font-semibold",
      };
    }

    // Check if rent is upcoming
    if (start > today) {
      const formattedDate = format(start, "dd MMM yyyy");
      return {
        text: locale === "ar"
          ? `${formattedDate} :${t("upcomingDue")}`
          : `${t("upcomingDue")}: ${formattedDate}`,
        textColor: "text-main-600 font-semibold",
      };
    }

    // Default: show status from API
    return {
      text: tModal(`status.${status.toLowerCase()}`),
      textColor: getStatusTextColor(status),
    };
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "text-green-500 font-semibold";
      case "PENDING":
        return "text-yellow-600 font-semibold";
      case "EXPIRED":
        return "text-gray-500 font-semibold";
      case "CANCELLED":
        return "text-red-500 font-semibold";
      default:
        return "text-gray-500 font-semibold";
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
        <div className={cn("space-y-2", locale === "ar" ? "text-right" : "text-left")}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {locale === "ar" ? `${property.code} :${t("code")}` : `${t("code")}: ${property.code}`}
          </p>
          <h3 className="font-semibold text-base line-clamp-2 text-main-600 dark:text-white">
            {property.title}
          </h3>
          <div className={cn("flex items-center gap-2 text-gray-600 dark:text-gray-400", locale === "ar" && "flex-row-reverse")}>
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1 capitalize">
              {property.city}, {property.country}
            </span>
          </div>
          <p className={rentStatus.textColor}>
            {rentStatus.text}
          </p>
        </div>

        <div className={cn("space-y-2 text-sm", locale === "ar" && "text-right")}>

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
