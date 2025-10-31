"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, MapPin, User, Home, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const { property, user, status, startDate, endDate, amount } = rent;
  const currency = useCountryCurrency(property.country);

  const formatDate = (date: string) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg dark:hover:shadow-gray-800/50"
      onClick={onClick}
    >
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800">
        {property.image ? (
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Home className="h-16 w-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(status)}>
            {tModal(`status.${status.toLowerCase()}`)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1 text-gray-900 dark:text-white">
            {property.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("code")}: {property.code}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {property.city}, {property.country}
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">
                {t("tenant")}: {user.name}
              </span>
            </div>
          )}

          {amount && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span className="font-medium">
                {amount} {currency}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="text-xs">
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
            {tCategories(property.category)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
