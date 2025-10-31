"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Home,
  Building2,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { getRentById } from "@/lib/services/api/rents";
import { useCountryCurrency } from "@/hooks/use-country-currency";

interface RentDetailsModalProps {
  rentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RentDetailsModal({
  rentId,
  isOpen,
  onClose,
}: RentDetailsModalProps) {
  const t = useTranslations("User.MyRealEstates.RentDetailsModal");
  const tCategories = useTranslations("General.Categories");

  const { data: rent, isLoading } = useQuery({
    queryKey: ["rent-details", rentId],
    queryFn: () => getRentById(rentId!),
    enabled: !!rentId && isOpen,
  });

  const currency = useCountryCurrency(rent?.property?.country);

  const formatDate = (date: string) => {
    return format(new Date(date), "MMMM dd, yyyy");
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-500 text-white";
      case "PENDING":
        return "bg-yellow-500 text-white";
      case "EXPIRED":
        return "bg-gray-500 text-white";
      case "CANCELLED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 bg-white dark:bg-gray-950">
        <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 bg-white dark:bg-gray-950 z-10 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {isLoading ? t("loading") : rent ? rent.property.title : t("title")}
              </DialogTitle>
              {rent && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t("code")}: {rent.property.code}
                </p>
              )}
            </div>
            {rent && (
              <Badge className={`${getStatusColor(rent.status)} shrink-0`}>
                {t(`status.${rent.status.toLowerCase()}`)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12 px-6 bg-white dark:bg-gray-950">
            <Spinner className="h-12 w-12 text-main-400" />
          </div>
        ) : rent ? (
          <div className="px-6 pb-6 space-y-6 bg-white dark:bg-gray-950">
            {/* Property Image */}
            {rent.property.image && (
              <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
                <Image
                  src={rent.property.image}
                  alt={rent.property.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Property Details */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("property-details")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t("location")}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {rent.property.city}, {rent.property.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t("category")}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {tCategories(rent.property.category)}
                    </p>
                  </div>
                </div>

                {rent.property.type && (
                  <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg col-span-2">
                    <Home className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("type")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {rent.property.type}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rental Period */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("rental-period")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t("start-date")}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(rent.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t("end-date")}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(rent.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Information */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t("rental-info")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {rent.amount && (
                  <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("amount")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {rent.amount} {currency}
                      </p>
                    </div>
                  </div>
                )}

                {rent.rentType && (
                  <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("rent-type")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {t(`rent-types.${rent.rentType.toLowerCase()}`)}
                      </p>
                    </div>
                  </div>
                )}

                {rent.lastPaidAt && (
                  <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg col-span-2">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("last-paid")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(rent.lastPaidAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tenant Information */}
            {rent.user && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("tenant-info")}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("tenant-name")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {rent.user.name}
                      </p>
                    </div>
                  </div>

                  {rent.user.phoneNumber && (
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t("phone")}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {rent.user.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {rent.user.nationalID && (
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t("national-id")}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {rent.user.nationalID}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 pb-6 text-center text-gray-500 dark:text-gray-400">
            {t("no-data")}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
