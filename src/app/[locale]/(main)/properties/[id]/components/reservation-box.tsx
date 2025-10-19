"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Property } from "@/lib/services/api/properties";
import { getLocalizedPath } from "@/lib/utils";
import { toast } from "sonner";
import { axiosClient } from "@/lib/services/axios-client";
import { Button } from "@/components/ui/button";
import { FileText, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ScheduleTour from "./schedule-tour";

interface ReservationBoxProps {
  property: Property;
}

export default function ReservationBox({ property }: ReservationBoxProps) {
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const [confirmedUser, setConfirmedUser] = useState(false);
  const [isContactOwnerOpen, setIsContactOwnerOpen] = useState(false);
  const [isScheduleTourOpen, setIsScheduleTourOpen] = useState(false);

  const t = useTranslations("Properties.Details.Reservations");
  const tPrice = useTranslations("Properties.Price");
  const tCategories = useTranslations("General.Categories");

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

  const getPropertyPrice = () => {
    if (property.dailyPrice) return property.dailyPrice;
    if (property.weeklyPrice) return property.weeklyPrice;
    if (property.monthlyPrice) return property.monthlyPrice;
    return 0;
  };

  const getPropertyPeriod = () => {
    if (property.isDaily) return "day";
    if (property.isWeekly) return "week";
    if (property.isMonthly) return "month";
    return "month";
  };

  const decideSubmitButtonLinkHref = () => {
    if (property.offerType === "rent") {
      if (confirmedUser) {
        return getLocalizedPath(`/application/${property._id}`, locale);
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
      router.push(getLocalizedPath("/login", locale));
      return;
    }

    if (property.offerType === "sale") {
      // Request purchase/installment
      const body = {
        property: property._id,
      };

      try {
        const response = await axiosClient.post("/installments", body);

        if (response.status === 200) {
          toast.success("Purchase request submitted successfully, pending owner confirmation.");
        }
      } catch (e: any) {
        toast.error(e.response?.data?.errors?.[0]?.msg || "Failed to submit request");
      }
    } else if (property.offerType === "rent") {
      // Navigate to application page
      const href = decideSubmitButtonLinkHref();
      if (href) {
        router.push(href);
      }
    } else {
      // Show contact owner modal
      setIsContactOwnerOpen(true);
    }
  };

  const isTentGroup = property.category === "tent_group";
  const isReplacement = property.offerType === "replacement";

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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("OwnerModal.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{t("OwnerModal.email")}</p>
              <p className="font-medium">{property.owner.email}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{t("OwnerModal.mobile")}</p>
              <p className="font-medium">{property.owner.phoneNumber}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reservation Box */}
      <div className="sticky top-24 rounded-md border-[1.5px] border-gray-200 p-6 dark:border-gray-700">
        {isTentGroup ? (
          <p className="text-center text-sm text-black dark:text-white">{t("tent-group")}</p>
        ) : isReplacement ? (
          <p className="text-center text-black dark:text-white">
            {t("replace-with")} {tCategories(property.replaceWith || "")}
          </p>
        ) : (
          <div
            className={`flex ${
              locale === "en" ? "flex-row" : "flex-row-reverse"
            } justify-between`}
          >
            <div
              className={`flex flex-col ${
                locale === "en" ? "items-start" : "items-end"
              }`}
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {property.offerType === "rent" ? t("rent-price") : t("price")}
              </span>
              <p className="text-lg font-bold text-yellow-600">
                {getPropertyPrice()} {t("kwd")}
                {property.offerType === "rent" && (
                  <sub>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {" "}
                      / {tPrice(getPropertyPeriod())}
                    </span>
                  </sub>
                )}
              </p>
            </div>
            {property.minMonths && (
              <div className="flex flex-col items-center">
                <span className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {t("min-months")}
                </span>
                <p className="text-yellow-600">{property.minMonths}</p>
              </div>
            )}
          </div>
        )}

        <Button
          className="my-6 flex w-full items-center justify-center gap-2"
          onClick={handleMainSubmitButtonClick}
        >
          <FileText className="h-5 w-5" />
          <span className="font-bold">{property && t(property.offerType)}</span>
        </Button>

        <div className="my-6 h-px bg-gray-200 dark:bg-gray-700" />

        <p className="my-6 text-center text-lg font-bold">{t("request-home-tour")}</p>

        <Button
          className="my-6 flex w-full items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsScheduleTourOpen(true)}
        >
          <MapPin className="h-5 w-5" />
          <span className="font-bold text-white">{t("request-tour")}</span>
        </Button>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">{t("tour-text")}</p>
      </div>
    </>
  );
}
