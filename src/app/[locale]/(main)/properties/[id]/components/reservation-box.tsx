"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { type Property } from "@/lib/services/api/properties";
import { createInstallmentRequest } from "@/lib/services/api/installments";
import { getLocalizedPath, cn } from "@/lib/utils";
import { getPropertyPrice, getPropertyPeriod, formatPrice, getOtherPrices } from "@/lib/utils/property-pricing";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfirmationDialog from "@/components/dialogs/confirmation-dialog";
import { toast } from "sonner";
import Image from "next/image";
import ScheduleTour from "./schedule-tour";

interface ReservationBoxProps {
  property: Property;
  currency?: string;
}

export default function ReservationBox({ property, currency = "KWD" }: ReservationBoxProps) {
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [confirmedUser, setConfirmedUser] = useState(false);
  const [isContactOwnerOpen, setIsContactOwnerOpen] = useState(false);
  const [isScheduleTourOpen, setIsScheduleTourOpen] = useState(false);
  const [isInstallmentConfirmOpen, setIsInstallmentConfirmOpen] = useState(false);

  const t = useTranslations("Properties.Details.Reservations");
  const tGeneral = useTranslations("General");

  const installmentMutation = useMutation({
    mutationFn: createInstallmentRequest,
    onSuccess: () => {
      toast.success(t("installment-request-success"));
      setIsInstallmentConfirmOpen(false);
    },
    onError: () => {
      toast.error(t("installment-request-error"));
    },
  });

  const handleInstallmentConfirm = () => {
    installmentMutation.mutate({ property: property._id });
  };
  const tPrice = useTranslations("Properties.Price");
  const tCategories = useTranslations("General.Categories");

  // Validate owner image URL
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== "string" || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validOwnerImage = isValidImageUrl(property.owner.image) ? property.owner.image : null;

  // TODO: Re-enable OTP check when endpoint is ready
  // useEffect(() => {
  //   if (session) {
  //     const isUserConfirmed = async () => {
  //       try {
  //         const res = await axiosClient.get("/otp_requests/check");

  //         if (
  //           res.data.success &&
  //           res.data.status !== "has_pending_request" &&
  //           res.data.status !== null
  //         ) {
  //           setConfirmedUser(true);
  //         }
  //       } catch (e) {
  //         console.error(e);
  //       }
  //     };

  //     isUserConfirmed();
  //   }
  // }, [session]);

  // Temporarily set confirmed user to true for all authenticated users
  useEffect(() => {
    if (session) {
      setConfirmedUser(true);
    }
  }, [session]);

  const price = getPropertyPrice(property);
  const period = getPropertyPeriod(property);
  const otherPrices = getOtherPrices(property, period, currency, locale, tPrice);

  const decideSubmitButtonLinkHref = () => {
    if (property.offerType === "rent") {
      if (confirmedUser) {
        return getLocalizedPath(`/rent/${property._id}`, locale);
      } else {
        return getLocalizedPath("/login/confirm", locale);
      }
    } else if (property.offerType === "sale") {
      if (!confirmedUser) {
        return getLocalizedPath("/login/confirm", locale);
      }
    }
    return "";
  };

  const handleMainSubmitButtonClick = async () => {
    if (!session) {
      const currentPath = encodeURIComponent(pathname);
      router.push(getLocalizedPath(`/login?redirect=${currentPath}`, locale));
      return;
    }

    if (property.offerType === "rent" && property.adType === "management") {
      const href = decideSubmitButtonLinkHref();
      if (href) {
        router.push(href);
      }
    } else if (property.offerType === "installment") {
      setIsInstallmentConfirmOpen(true);
    } else {
      setIsContactOwnerOpen(true);
    }
  };

  const isTentGroup = property.category === "tent_group";
  const isReplacement = property.offerType === "replacement";

  // Determine button text based on offer type and ad type
  const getButtonText = () => {
    if (property.offerType === "rent" && property.adType === "management") {
      return t("rent");
    }
    if (property.offerType === "rent" && property.adType === "ad") {
      return t("contact-owner");
    }
    if (property.offerType === "installment") {
      return t("request-installment");
    }
    return t("contact-owner");
  };

  const getInitials = (name: string): string => {
    if (!name) return "?";
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  return (
    <>
      {/* Schedule Tour Modal */}
      <ScheduleTour
        visible={isScheduleTourOpen}
        setVisible={setIsScheduleTourOpen}
        ownerId={property.owner._id}
        propertyId={property._id}
      />

      {/* Contact Owner Modal */}
      <Dialog open={isContactOwnerOpen} onOpenChange={setIsContactOwnerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={cn("text-center text-xl font-bold", locale === "ar" && "text-right")}>
              {t("OwnerModal.title")}
            </DialogTitle>
          </DialogHeader>
          <div className={cn("space-y-6 py-4", locale === "ar" && "text-right")}>
            {/* Owner Image and Name */}
            <div className="flex flex-col items-center gap-4">
              {validOwnerImage ? (
                <Image
                  src={validOwnerImage}
                  alt={property.owner.name || "Owner"}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover border-4 border-main-100"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-main-100 border-4 border-main-200">
                  <span className="text-3xl font-bold text-main-600">
                    {getInitials(property.owner.name)}
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {property.owner.name || "Owner"}
                </h3>
              </div>
            </div>

            {/* Phone Number */}
            <div className={cn(
              "flex items-center gap-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4",
              locale === "ar" && "flex-row-reverse"
            )}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-main-100">
                <Phone className="h-6 w-6 text-main-600" />
              </div>
              <div className={cn("flex-1", locale === "ar" && "text-right")}>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("OwnerModal.mobile")}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white" dir="ltr">
                  {property.owner.phoneNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Call Button */}
            {property.owner.phoneNumber && (
              <a
                href={`tel:${property.owner.phoneNumber}`}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg bg-main-600 px-6 py-3 text-white font-semibold hover:bg-main-700 transition-colors",
                  locale === "ar" && "flex-row-reverse"
                )}
              >
                <Phone className="h-5 w-5" />
                <span>{t("OwnerModal.call")}</span>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Installment Confirmation Dialog */}
      <ConfirmationDialog
        open={isInstallmentConfirmOpen}
        onOpenChange={setIsInstallmentConfirmOpen}
        title={t("InstallmentModal.title")}
        description={t("InstallmentModal.description")}
        cancelText={t("InstallmentModal.cancel")}
        confirmText={t("InstallmentModal.confirm")}
        onConfirm={handleInstallmentConfirm}
        isLoading={installmentMutation.isPending}
        loadingText={t("InstallmentModal.submitting")}
        titleClassName={locale === "ar" ? "text-right" : ""}
      />

      {/* Reservation Box */}
      <div className="rounded-xl border-[1.5px] border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
        {isTentGroup ? (
          <p className="text-center text-sm text-black dark:text-white">{t("tent-group")}</p>
        ) : isReplacement ? (
          <p className="text-center text-black dark:text-white">
            {t("replace-with")} {tCategories(property.replaceWith || "")}
          </p>
        ) : (
          <div className="space-y-4">
            {/* All Prices Display */}
            {property.offerType === "rent" && (
              <div className="space-y-2">
                {property.dailyPrice && (
                  <div className={cn("flex items-center justify-between", locale === "ar" && "flex-row-reverse")}>
                    <span className="text-gray-500 text-sm">{tPrice("day")}</span>
                    <span className="text-main-600 font-bold">{formatPrice(property.dailyPrice, currency, locale)}</span>
                  </div>
                )}
                {property.weeklyPrice && (
                  <div className={cn("flex items-center justify-between", locale === "ar" && "flex-row-reverse")}>
                    <span className="text-gray-500 text-sm">{tPrice("week")}</span>
                    <span className="text-main-600 font-bold">{formatPrice(property.weeklyPrice, currency, locale)}</span>
                  </div>
                )}
                {property.monthlyPrice && (
                  <div className={cn("flex items-center justify-between", locale === "ar" && "flex-row-reverse")}>
                    <span className="text-gray-500 text-sm">{tPrice("month")}</span>
                    <span className="text-main-600 font-bold">{formatPrice(property.monthlyPrice, currency, locale)}</span>
                  </div>
                )}
                {property.weekdaysPrice && (
                  <div className={cn("flex items-center justify-between", locale === "ar" && "flex-row-reverse")}>
                    <span className="text-gray-500 text-sm">{tPrice("weekdays")}</span>
                    <span className="text-main-600 font-bold">{formatPrice(property.weekdaysPrice, currency, locale)}</span>
                  </div>
                )}
                {property.holidaysPrice && (
                  <div className={cn("flex items-center justify-between", locale === "ar" && "flex-row-reverse")}>
                    <span className="text-gray-500 text-sm">{tPrice("holidays")}</span>
                    <span className="text-main-600 font-bold">{formatPrice(property.holidaysPrice, currency, locale)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Non-rent price display */}
            {property.offerType !== "rent" && price && (
              <div className={cn("flex items-center gap-2", locale === "ar" && "flex-row-reverse")}>
                <span className="text-main-600 font-bold text-lg">{formatPrice(price, currency, locale)}</span>
              </div>
            )}

            {/* Min Months if applicable */}
            {property.minMonths && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("min-months")} {property.minMonths}
              </p>
            )}
          </div>
        )}

        {/* Main Action Button */}
        <Button
          className="mt-6 flex w-full items-center bg-main-600 text-white hover:bg-main-500 justify-center gap-2 h-12 font-semibold shadow-sm hover:shadow-md transition-all"
          onClick={handleMainSubmitButtonClick}
        >
          <FileText className="h-5 w-5" />
          <span className="font-bold">{getButtonText()}</span>
        </Button>

        {/* Tour Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700" dir={locale === "ar" ? "rtl" : "ltr"}>
          <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t("tour-title")}</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t("request-home-tour")}</p>

          <Button
            variant="outline"
            className="flex w-full items-center justify-center gap-2 h-12 border-0 text-white bg-steelBlue-500 hover:text-steelBlue-500 hover:border-steelBlue-500 hover:border font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setIsScheduleTourOpen(true)}
            disabled={!session}
          >
            <MapPin className="h-5 w-5" />
            <span className="font-bold">{t("request-tour")}</span>
          </Button>

          {!session && (
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">{t("login-to-schedule")}</p>
          )}
        </div>
      </div>
    </>
  );
}
