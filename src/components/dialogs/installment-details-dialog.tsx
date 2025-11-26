"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calendar, DollarSign, User, Home, FileText, MapPin, Check, X } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useInstallmentDetails, useUpdateInstallmentUserStatus } from "@/hooks/use-installments";
import { Spinner } from "@/components/ui/spinner";
import Typography from "@/components/shared/typography";
import { getLocalizedPath, getProxiedImageUrl } from "@/lib/utils";
import { useCountryCurrency } from "@/hooks/use-country-currency";
import { toast } from "sonner";
import { type CustomInstallment } from "@/lib/services/api/installments";
import PropertyCard from "../shared/property-card";
import { getPropertyPrice } from "@/lib/utils/property";
import { type Property } from "@/types";
import { formatPrice } from "@/lib/utils/property-pricing";
import Link from "next/link";

interface InstallmentDetailsDialogProps {
  installmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to calculate installment schedule
const calculateInstallmentSchedule = (
  amount: number,
  installmentPeriod: number, // in months
  installmentType: string,
  startDate: string
) => {
  const schedules: { date: string; amount: number; installmentNumber: number }[] = [];

  // Determine the frequency in months
  const frequencyMap: Record<string, number> = {
    monthly: 1,
    quarterly: 3,
    semiAnnually: 6,
    annually: 12,
  };

  const frequency = frequencyMap[installmentType] || 1;
  const numberOfInstallments = Math.ceil(installmentPeriod / frequency);
  const amountPerInstallment = amount / numberOfInstallments;

  const start = new Date(startDate);

  for (let i = 0; i < numberOfInstallments; i++) {
    const installmentDate = new Date(start);
    installmentDate.setMonth(start.getMonth() + (i * frequency));

    schedules.push({
      date: installmentDate.toISOString(),
      amount: amountPerInstallment,
      installmentNumber: i + 1,
    });
  }

  return schedules;
};

export default function InstallmentDetailsDialog({
  installmentId,
  open,
  onOpenChange,
}: InstallmentDetailsDialogProps) {
  const t = useTranslations("User.MyRequests");
  const locale = useLocale();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(null);

  const { data: installmentData, isLoading } = useInstallmentDetails(installmentId);
  const installment = installmentData?.data;
  const currency = useCountryCurrency(installment?.property?.country);
  const updateStatusMutation = useUpdateInstallmentUserStatus();

  const handleActionClick = (action: "APPROVED" | "REJECTED") => {
    setActionType(action);
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    if (!installmentId || !actionType) return;

    try {
      await updateStatusMutation.mutateAsync({
        installmentId,
        payload: { status: actionType },
      });

      toast.success(
        actionType === "APPROVED"
          ? t("installment-approved-success")
          : t("installment-rejected-success")
      );

      setShowConfirmation(false);
      onOpenChange(false);
    } catch (error) {
      toast.error(t("installment-action-error"));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    switch (normalizedStatus) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const installmentSchedule = installment && installment.amount && installment.installmentPeriod && installment.installmentType && installment.startDate
    ? calculateInstallmentSchedule(
      installment.amount,
      installment.installmentPeriod,
      installment.installmentType,
      installment.startDate
    )
    : installment?.installments?.sort((a: CustomInstallment, b: CustomInstallment) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((inst: CustomInstallment, index: number) => {
      return {
        date: inst.date,
        amount: inst.amount,
        installmentNumber: index + 1
      }
    });

  const locationStr = [installment?.property.region, installment?.property.city, installment?.property.country]
    .filter(Boolean)
    .join(", ");

  const price = getPropertyPrice(installment?.property as Property);
  const priceDisplay = price ? formatPrice(price, currency, locale) : t("price-not-available");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span>{t("installment-details")}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-12 w-12 text-main-400" />
          </div>
        ) : installment ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className={`flex w-full ${locale === "ar" && "flex-row-reverse"} `}>
              <TabsTrigger value="details">{t("installment-details-tab")}</TabsTrigger>
              <TabsTrigger value="plan">{t("installment-plan-tab")}</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Property Information */}

              {installment.property && (
                <>
                  <Typography variant="h5" as="h5" className={`font-bold flex items-center gap-2 capitalize ${locale === "ar" && "flex-row-reverse"}`}>
                    <Home className="h-5 w-5 text-main-600" />
                    {t("property-information")}
                  </Typography>
                  <Link href={getLocalizedPath(`/properties/${installment.property._id}`, locale)}>
                    <PropertyCard
                      variant="featured"
                      image={getProxiedImageUrl(installment.property.image || installment.property.video)}
                      name={installment.property.title || "Property"}
                      location={locationStr || t("location-not-specified")}
                      price={priceDisplay}
                      badge="installment"
                      propertyId={installment?.property._id}
                    />
                  </Link>
                </>
              )}

              {/* Owner Information */}
              {installment.owner && (
                <div className="space-y-4 mt-4">
                  <Typography variant="h5" as="h5" className={`font-bold flex items-center gap-2 capitalize ${locale === "ar" && "flex-row-reverse"}`}>
                    <User className="h-5 w-5 text-main-600" />
                    {t("owner-information")}
                  </Typography>
                  <div className={`flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${locale === "ar" && "flex-row-reverse"}`}>
                    {installment.owner.image && (installment.owner.image.startsWith('/') || installment.owner.image.startsWith('http')) ? (
                      <Image
                        src={getProxiedImageUrl(installment.owner.image)}
                        alt={installment.owner.name}
                        width={60}
                        height={60}
                        className="h-15 w-15 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-15 w-15 rounded-full bg-main-100 flex items-center justify-center">
                        <User className="h-8 w-8 text-main-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      {installment.owner._id ? (
                        <Link href={getLocalizedPath(`/companies/${installment.owner._id}`, locale)}>
                          <Typography variant="body-md" as="p" className="font-semibold mb-1 capitalize text-main-600 hover:text-main-500 hover:underline transition-colors cursor-pointer">
                            {installment.owner.name}
                          </Typography>
                        </Link>
                      ) : (
                        <Typography variant="body-md" as="p" className="font-semibold mb-1 capitalize">
                          {installment.owner.name}
                        </Typography>
                      )}
                      <Typography variant="body-sm" as="p" className="text-gray-600 dark:text-gray-400 capitalize">
                        {installment.owner.phoneNumber}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              {/* Installment Details */}
              <div className="space-y-4">
                <Typography variant="h5" as="h5" className={`font-bold flex items-center gap-2 capitalize ${locale === "ar" && "flex-row-reverse"}`}>
                  <FileText className="h-5 w-5 text-main-600" />
                  {t("installment-information")}
                </Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 items-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {installment.amount && (
                    <div className="flex flex-col items-center">
                      <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 mb-1 capitalize">
                        {t("total-amount")}
                      </Typography>
                      <Typography variant="body-md" as="p" className="font-semibold flex items-center gap-1 capitalize">
                        <DollarSign className="h-4 w-4" />
                        {installment.amount} {currency}
                      </Typography>
                    </div>
                  )}
                  {installment.installmentPeriod && (
                    <div className="flex flex-col items-center">
                      <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 mb-1 capitalize">
                        {t("installment-period")}
                      </Typography>
                      <Typography variant="body-md" as="p" className="font-semibold capitalize">
                        {installment.installmentPeriod} {t("months")}
                      </Typography>
                    </div>
                  )}
                  {installment.installmentType && (
                    <div className="flex flex-col items-center">
                      <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 mb-1 capitalize">
                        {t("installment-type")}
                      </Typography>
                      <Typography variant="body-md" as="p" className="font-semibold capitalize">
                        {installment.installmentType}
                      </Typography>
                    </div>
                  )}
                  {installment.installmentPlan && (
                    <div className="flex flex-col items-center">
                      <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 mb-1 capitalize">
                        {t("installment-plan")}
                      </Typography>
                      <Typography variant="body-md" as="p" className="font-semibold capitalize">
                        {installment.installmentPlan}
                      </Typography>
                    </div>
                  )}
                  {installment.startDate && (
                    <div className="flex flex-col items-center">
                      <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 mb-1 capitalize">
                        {t("start-date")}
                      </Typography>
                      <Typography variant="body-md" as="p" className="font-semibold flex items-center gap-1 capitalize">
                        <Calendar className="h-4 w-4" />
                        {formatDate(installment.startDate)}
                      </Typography>
                    </div>
                  )}
                  {installment.endDate && (
                    <div className="flex flex-col items-center">
                      <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 mb-1 capitalize">
                        {t("end-date")}
                      </Typography>
                      <Typography variant="body-md" as="p" className="font-semibold flex items-center gap-1 capitalize">
                        <Calendar className="h-4 w-4" />
                        {formatDate(installment.endDate)}
                      </Typography>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 mb-1 capitalize">
                      {t("created-at")}
                    </Typography>
                    <Typography variant="body-md" as="p" className="font-semibold capitalize">
                      {formatDate(installment.createdAt)}
                    </Typography>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="space-y-4 mt-6">
              <Typography variant="h5" as="h5" className="font-bold flex items-center gap-2 mb-4 capitalize">
                <DollarSign className="h-5 w-5 text-main-600" />
                {t("payment-schedule")}
              </Typography>

              {installmentSchedule && installmentSchedule.length > 0 ? (
                <div className="space-y-3">
                  {installmentSchedule.map((schedule) => (
                    <div
                      key={schedule.installmentNumber}
                      className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 ${locale === "ar" && "flex-row-reverse"} dark:border-gray-700 hover:shadow-md transition-shadow`}
                    >
                      <div className={`flex items-center gap-4 ${locale === "ar" && "flex-row-reverse"}`}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-main-100">
                          <Typography variant="body-lg-medium" as="span" className="text-main-600 font-bold capitalize">
                            #{schedule.installmentNumber}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="body-sm" as="p" className={`text-gray-500 flex ${locale === "ar" && "flex-row-reverse"} dark:text-gray-400 capitalize`}>
                            {t("payment-date")}
                          </Typography>
                          <Typography variant="body-md" as="p" className={`font-semibold flex ${locale === "ar" && "flex-row-reverse"} items-center gap-1 capitalize`}>
                            <Calendar className="h-4 w-4" />
                            {formatDate(schedule.date)}
                          </Typography>
                        </div>
                      </div>
                      <div className="text-right">
                        <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400 capitalize">
                          {t("amount")}
                        </Typography>
                        <Typography variant="body-lg-medium" as="p" className="font-bold text-main-600 capitalize">
                          {schedule.amount.toFixed(2)} {currency}
                        </Typography>
                      </div>
                    </div>
                  ))}

                  {/* Total Summary */}
                  <div className="mt-6 p-4 bg-main-50 dark:bg-main-900/20 rounded-lg border-2 border-main-200 dark:border-main-800">
                    <div className="flex items-center justify-between">
                      <Typography variant="body-lg-medium" as="p" className="font-bold capitalize">
                        {t("total-amount")}
                      </Typography>
                      <Typography variant="h4" as="p" className="font-bold text-main-600 capitalize">
                        {installment?.amount?.toFixed(2)} {currency}
                      </Typography>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 capitalize">
                      <span>{t("number-of-installments")}: {installmentSchedule.length}</span>
                      {installment?.installmentType && <span>{t("payment-frequency")}: {installment?.installmentType}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Typography variant="body-md" as="p" className="text-gray-500 capitalize">
                    {t("no-payment-schedule")}
                  </Typography>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-12 text-center">
            <Typography variant="body-md" as="p" className="text-gray-500 capitalize">
              {t("installment-not-found")}
            </Typography>
          </div>
        )}

        {/* Footer with Action Buttons - Only show if owner approved and user pending */}
        {installment &&
          installment.ownerStatus?.toLowerCase() === "approved" &&
          installment.userStatus?.toLowerCase() === "pending" && (
            <DialogFooter className="flex gap-2 sm:gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => handleActionClick("REJECTED")}
                disabled={updateStatusMutation.isPending}
                className="flex-1"
              >
                {updateStatusMutation.isPending && actionType === "REJECTED" ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                {t("reject")}
              </Button>
              <Button
                onClick={() => handleActionClick("APPROVED")}
                disabled={updateStatusMutation.isPending}
                className="flex-1 bg-main-600 text-white hover:bg-main-300 hover:text-main-500 font-semibold shadow-sm hover:shadow-md transition-all"
              >
                {updateStatusMutation.isPending && actionType === "APPROVED" ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {t("approve")}
              </Button>
            </DialogFooter>
          )}
      </DialogContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="bg-white dark:bg-gray-950">
          <AlertDialogHeader>
            <AlertDialogTitle className={" text-center text-gray-900 dark:text-white"}>
              {actionType === "APPROVED"
                ? t("confirmation.approve.title")
                : t("confirmation.reject.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-start text-gray-600 dark:text-gray-400">
              {actionType === "APPROVED"
                ? t("confirmation.approve.description")
                : t("confirmation.reject.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" className="text-gray-900 dark:text-white">
                {t("confirmation.cancel")}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleConfirmAction}
                className="bg-main-600 text-white hover:bg-main-300 hover:text-main-500 font-semibold shadow-sm hover:shadow-md transition-all"
              >
                {t("confirmation.confirm")}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
