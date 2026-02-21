"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { type Property } from "@/lib/services/api/properties";
import { createInstallmentRequest } from "@/lib/services/api/installments";
import { getLocalizedPath, cn } from "@/lib/utils";
import {
  getPropertyPrice,
  formatPrice,
  applyDiscount,
} from "@/lib/utils/property-pricing";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmationDialog from "@/components/dialogs/confirmation-dialog";
import { toast } from "sonner";
import Image from "next/image";
import ScheduleTour from "./schedule-tour";
import { axiosClient } from "@/lib/services";
import { useGetUser } from "@/hooks/use-user";

interface ReservationBoxProps {
  property: Property;
  currency?: string;
}

export default function ReservationBox({
  property,
  currency = "KWD",
}: ReservationBoxProps) {
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const otpRefs = useRef<HTMLInputElement[]>([]);

  const {data: user, refetch} = useGetUser()

  // Helper to focus next/prev
  const focusNext = (index: number) => {
    if (index < 5) otpRefs.current[index + 1]?.focus();
  };
  const focusPrev = (index: number) => {
    if (index > 0) otpRefs.current[index - 1]?.focus();
  };

  // Handle change + auto-advance
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // safety

    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    if (value) focusNext(index);
  };

  // Handle backspace / arrow keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !e.currentTarget.value) {
      focusPrev(index);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusPrev(index);
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      focusNext(index);
    }
  };

  // Paste handler (optional but nice)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6 - index);
    if (!paste) return;

    const newOtp = otp.split("");
    for (let i = 0; i < paste.length && index + i < 6; i++) {
      newOtp[index + i] = paste[i];
    }
    setOtp(newOtp.join(""));

    const nextFocus = Math.min(index + paste.length, 5);
    otpRefs.current[nextFocus]?.focus();
  };

  const t = useTranslations("Properties.Details.Reservations");
  const tPrice = useTranslations("Properties.Price");
  const tGeneral = useTranslations("General");
  const tVerify = useTranslations("Verify"); // ← assume you have this namespace

  const [confirmedUser, setConfirmedUser] = useState(false);
  const [isContactOwnerOpen, setIsContactOwnerOpen] = useState(false);
  const [isScheduleTourOpen, setIsScheduleTourOpen] = useState(false);
  const [isInstallmentConfirmOpen, setIsInstallmentConfirmOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");

  // ────────────────────────────────────────────────
  //  Check user OTP/confirmation status
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.accessToken) return;

    const checkConfirmation = async () => {
      try {
        setConfirmedUser(user?.data.isConfirmed ?? false);
      } catch (err) {
        console.error("OTP check failed", err);
        setConfirmedUser(false);
      }
    };

    checkConfirmation();
  }, [session, user]);

  // ────────────────────────────────────────────────
  //  Mutations
  // ────────────────────────────────────────────────
  const installmentMutation = useMutation({
    mutationFn: () => createInstallmentRequest({ property: property._id }),
    onSuccess: () => {
      toast.success(t("installment-request-success"));
      setIsInstallmentConfirmOpen(false);
    },
    onError: () => toast.error(t("installment-request-error")),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!otp || otp.length !== 6) throw new Error("Invalid OTP");
      return axiosClient.post(
        `/otp/${otp}`,
        {},
        { headers: { "Auth-Token": session?.user?.accessToken } }
      );
    },
    onSuccess: () => {
      toast.success(tVerify("success") || "Phone verified!");
      setConfirmedUser(true);
      setIsOtpModalOpen(false);
      setOtp("");
      // Continue with original action
      refetch()
    },
    onError: () => {
      toast.error(tVerify("invalid") || "Invalid or expired code.");
    },
  });

  // ────────────────────────────────────────────────
  //  Core action logic
  // ────────────────────────────────────────────────
  const performMainAction = () => {
    if (property.offerType === "rent" && property.adType === "management") {
      router.push(getLocalizedPath(`/rent/${property._id}`, locale));
    } else if (property.offerType === "installment") {
      setIsInstallmentConfirmOpen(true);
    } else {
      setIsContactOwnerOpen(true);
    }
  };

  const handleMainButtonClick = () => {
    if (!session) {
      const redirect = encodeURIComponent(pathname);
      router.push(getLocalizedPath(`/login?redirect=${redirect}`, locale));
      return;
    }

    if (confirmedUser) {
      performMainAction();
    } else {
      setIsOtpModalOpen(true);
    }
  };

  // ────────────────────────────────────────────────
  //  Helpers
  // ────────────────────────────────────────────────
  const price = getPropertyPrice(property);
  const isDiscountActive =
    property.discount > 0 &&
    new Date(property.discountStartDate ?? 0).getTime() <= Date.now() &&
    new Date(property.discountEndDate ?? 0).getTime() >= Date.now();

  const isTentGroup = property.category === "tent_group";
  const isReplacement = property.offerType === "replacement";

  const getMainButtonLabel = () => {
    if (property.offerType === "rent" && property.adType === "management") return t("rent");
    if (property.offerType === "installment") return t("request-installment");
    return t("contact-owner");
  };

  const getInitials = (name?: string) =>
    name
      ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
      : "?";

  const validOwnerImage = property.owner.image?.trim()
    ? property.owner.image
    : null;

  // ────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────
  return (
    <>
      {/* ── Modals ──────────────────────────────────────── */}

      <ScheduleTour
        visible={isScheduleTourOpen}
        setVisible={setIsScheduleTourOpen}
        ownerId={property.owner._id}
        propertyId={property._id}
      />

      {/* Contact Owner */}
      <Dialog open={isContactOwnerOpen} onOpenChange={setIsContactOwnerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={cn(locale === "ar" && "text-right")}>
              {t("OwnerModal.title")}
            </DialogTitle>
          </DialogHeader>
          <div className={cn("space-y-6 py-4", locale === "ar" && "text-right")}>
            {/* Owner avatar */}
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
              <h3 className="text-xl font-bold">{property.owner.name || "Owner"}</h3>
            </div>

            {/* Phone */}
            <div
              className={cn(
                "flex items-center gap-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4",
                locale === "ar" && "flex-row-reverse"
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-main-100">
                <Phone className="h-6 w-6 text-main-600" />
              </div>
              <div className={cn("flex-1", locale === "ar" && "text-right")}>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("OwnerModal.mobile")}
                </p>
                <p className="text-lg font-semibold" dir="ltr">
                  {property.owner.phoneNumber || "N/A"}
                </p>
              </div>
            </div>

            {property.owner.phoneNumber && (
              <a
                href={`tel:${property.owner.phoneNumber}`}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg bg-main-600 px-6 py-3 text-white font-semibold hover:bg-main-700",
                  locale === "ar" && "flex-row-reverse"
                )}
              >
                <Phone className="h-5 w-5" />
                {t("OwnerModal.call")}
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Installment Confirmation */}
      <ConfirmationDialog
        open={isInstallmentConfirmOpen}
        onOpenChange={setIsInstallmentConfirmOpen}
        title={t("InstallmentModal.title")}
        description={t("InstallmentModal.description")}
        cancelText={t("InstallmentModal.cancel")}
        confirmText={t("InstallmentModal.confirm")}
        onConfirm={() => installmentMutation.mutate()}
        isLoading={installmentMutation.isPending}
        loadingText={t("InstallmentModal.submitting")}
        titleClassName={locale === "ar" ? "text-right" : ""}
      />

      {/* OTP Verification Modal */}
      <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={cn(locale === "ar" && "text-right")}>
              {tVerify("title") || "Verify Your Phone"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center sm:text-left">
              {tVerify("description") ||
                "Please enter the 6-digit code sent to your phone to continue."}
            </p>

            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <React.Fragment key={index}>
                    {index === 3 && (
                      <span className="text-gray-400 mx-1 sm:mx-2">-</span>
                    )}
                    <input
                      ref={(el) => {
                        if (el) otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index] || ""}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={(e) => handlePaste(e, index)}
                      onFocus={(e) => e.target.select()} // optional: select on focus
                      className={cn(
                        "h-12 w-10 sm:h-14 sm:w-12 text-center text-2xl font-mono border border-input rounded-md",
                        "focus:outline-none focus:ring-2 focus:ring-main-500 focus:border-transparent",
                        "bg-background transition-all",
                        locale === "ar" && "font-sans" // better Arabic digit support if needed
                      )}
                      autoComplete="one-time-code" // helps iOS show autofill
                    />
                  </React.Fragment>
                ))}
              </div>

              <Button
                onClick={() => verifyOtpMutation.mutate()}
                disabled={verifyOtpMutation.isPending || otp.length !== 6}
                className="w-full max-w-xs bg-main-600 hover:bg-main-400 text-white font-semibold"
              >
                {verifyOtpMutation.isPending
                  ? tGeneral("verifying") || "Verifying..."
                  : tGeneral("submit") || "Verify"}
              </Button>
            </div>

            {/* Optional: resend link (uncomment when you implement resend logic) */}
            {/* <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        {tVerify("didnt-receive") || "Didn't receive the code?"}{" "}
        <button
          type="button"
          className="text-main-600 hover:underline font-medium"
          onClick={handleResendOtp} // ← add your resend handler
        >
          {tVerify("resend") || "Resend"}
        </button>
      </p> */}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Main Box ────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow transition-shadow dark:border-gray-700 dark:bg-gray-800">
        {isTentGroup ? (
          <p className="text-center text-sm">{t("tent-group")}</p>
        ) : isReplacement ? (
          <p className="text-center">
            {t("replace-with")}{" "}
            {tGeneral(`Categories.${property.replaceWith || ""}`)}
          </p>
        ) : (
          <div className="space-y-5">
            {/* ── Prices ── */}
            {property.offerType === "rent" ? (
              <div className="space-y-2.5">
                {[
                  { key: "dailyPrice", label: tPrice("day") },
                  { key: "weeklyPrice", label: tPrice("week") },
                  { key: "monthlyPrice", label: tPrice("month") },
                  { key: "weekdaysPrice", label: tPrice("weekdays") },
                  { key: "holidaysPrice", label: tPrice("holidays") },
                ].map(
                  ({ key, label }) =>
                    property[key as keyof Property] && (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center justify-between",
                          locale === "ar" && "flex-row-reverse"
                        )}
                      >
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {label}
                        </span>
                        {isDiscountActive ? (
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-main-600">
                              {formatPrice(
                                applyDiscount(
                                  property[key as keyof Property] as number,
                                  property.discount
                                ),
                                currency,
                                locale
                              )}
                            </span>
                            <span className="text-sm text-main-400 line-through">
                              {formatPrice(
                                property[key as keyof Property] as number,
                                currency,
                                locale
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-main-600">
                            {formatPrice(
                              property[key as keyof Property] as number,
                              currency,
                              locale
                            )}
                          </span>
                        )}
                      </div>
                    )
                )}
              </div>
            ) : (
              price && (
                <div
                  className={cn(
                    "flex items-center gap-2",
                    locale === "ar" && "flex-row-reverse"
                  )}
                >
                  <span className="text-xl font-bold text-main-600">
                    {formatPrice(price, currency, locale)}
                  </span>
                </div>
              )
            )}

            {property.minMonths && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("min-months")} {property.minMonths}
              </p>
            )}
          </div>
        )}

        {/* Main CTA */}
        <Button
          className="mt-6 w-full h-12 bg-main-600 hover:bg-main-700 text-white font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2.5"
          onClick={handleMainButtonClick}
        >
          <FileText className="h-5 w-5" />
          {getMainButtonLabel()}
        </Button>

        {/* Schedule Tour Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-lg font-bold mb-2">{t("tour-title")}</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("request-home-tour")}
          </p>

          <Button
            variant="outline"
            className="w-full h-12 border-steelBlue-500 text-white bg-steelBlue-500 hover:bg-transparent hover:text-steelBlue-500 font-semibold flex items-center gap-2.5 disabled:opacity-50"
            onClick={() => setIsScheduleTourOpen(true)}
            disabled={!session}
          >
            <MapPin className="h-5 w-5" />
            {t("request-tour")}
          </Button>

          {!session && (
            <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
              {t("login-to-schedule")}
            </p>
          )}
        </div>
      </div>
    </>
  );
}