import { useTranslations } from "next-intl";
import { Calendar, DollarSign, MapPin, User } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Typography from "@/components/shared/typography";
import type { Installment } from "@/lib/services/api/installments";
import { format } from "date-fns";

interface InstallmentCardProps {
  installment: Installment;
  onClick: () => void;
}

export default function InstallmentCard({
  installment,
  onClick,
}: InstallmentCardProps) {
  const t = useTranslations("User.MyRealEstates.InstallmentCard");

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-green-500 text-white";
      case "PENDING":
        return "bg-yellow-500 text-white";
      case "REJECTED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const normalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("not-available");
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getInstallmentTypeLabel = (type?: string) => {
    if (!type) return t("not-available");
    const typeMap: Record<string, string> = {
      monthly: t("monthly"),
      quarterly: t("quarterly"),
      semiAnnual: t("semi-annual"),
      annual: t("annual"),
    };
    return typeMap[type] || type;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Property Image */}
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800">
        <Image
          src={installment.property.image || "/no-apartment.png"}
          alt={installment.property.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content with padding */}
      <div className="p-6">
        {/* Title and code */}
        <div className="mb-4">
          <Typography variant="body-lg-medium" as="h5" className="font-bold mb-1">
            {installment.property.title}
          </Typography>
          <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 mb-2">
            {t("code")}: {installment.property.code}
          </Typography>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{installment.property.city}</span>
          </div>
        </div>

      {/* Status Badges */}
      <div className="flex gap-2 mb-4">
        <Badge className={getStatusColor(installment.ownerStatus)} variant="outline">
          {t("owner")}: {normalizeStatus(installment.ownerStatus)}
        </Badge>
        <Badge className={getStatusColor(installment.userStatus)} variant="outline">
          {t("user")}: {normalizeStatus(installment.userStatus)}
        </Badge>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {installment.amount && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div>
              <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                {t("amount")}
              </Typography>
              <Typography variant="body-sm" as="p" className="font-semibold">
                {installment.amount}
              </Typography>
            </div>
          </div>
        )}

        {installment.installmentPeriod && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div>
              <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                {t("period")}
              </Typography>
              <Typography variant="body-sm" as="p" className="font-semibold">
                {installment.installmentPeriod} {t("months")}
              </Typography>
            </div>
          </div>
        )}
      </div>

      {/* Installment Type */}
      {installment.installmentType && (
        <div className="mb-4">
          <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 mb-1">
            {t("type")}
          </Typography>
          <Typography variant="body-sm" as="p" className="font-semibold">
            {getInstallmentTypeLabel(installment.installmentType)}
          </Typography>
        </div>
      )}

      {/* Dates */}
      {installment.startDate && installment.endDate && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <div>
              <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                {t("start-date")}
              </Typography>
              <Typography variant="body-sm" as="p" className="font-semibold">
                {formatDate(installment.startDate)}
              </Typography>
            </div>
            <div className="text-right">
              <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                {t("end-date")}
              </Typography>
              <Typography variant="body-sm" as="p" className="font-semibold">
                {formatDate(installment.endDate)}
              </Typography>
            </div>
          </div>
        </div>
      )}

      {/* Owner Info */}
      {installment.owner && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
          {installment.owner.image ? (
            <Image
              src={installment.owner.image}
              alt={installment.owner.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div>
            <Typography variant="body-sm" as="p" className="font-medium">
              {installment.owner.name}
            </Typography>
            <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
              {installment.owner.phoneNumber}
            </Typography>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
