"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
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
  MoreVertical,
  Download,
  FileX,
  Wrench,
  AlertCircle,
  FileWarning,
  FileText,
  ExternalLink,
  Tent,
  Hotel,
  MessageSquare,
  Paperclip,
  PaperclipIcon,
  Navigation,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PaginationControls from "@/components/shared/pagination-controls";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getRentById } from "@/lib/services/api/rents";
import { getTenantClaims, Claim } from "@/lib/services/api/claims";
import { downloadRentInvoices } from "@/lib/services/api/invoices";
import { useCountryCurrency } from "@/hooks/use-country-currency";
import PickupLocationMapView from "@/components/ui/pickup-location-map-view";
import RentInvoicesTab from "./rent-invoices-tab";
import RequestEndContractDialog from "./request-end-contract-dialog";
import AddClaimsDialog from "./add-claims-dialog";
import DisclaimerRequestDialog from "./disclaimer-request-dialog";
import RequestServicesDialog from "./request-services-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FaComment } from "react-icons/fa";
import { Paper } from "@mui/material";

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
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [showEndContractDialog, setShowEndContractDialog] = useState(false);
  const [showClaimsDialog, setShowClaimsDialog] = useState(false);
  const [showDisclaimerDialog, setShowDisclaimerDialog] = useState(false);
  const [showServicesDialog, setShowServicesDialog] = useState(false);
  const [claimsPage, setClaimsPage] = useState(1);
  const [claimsSubTab, setClaimsSubTab] = useState<"user" | "owner">("user");

  const { data: rent, isLoading } = useQuery({
    queryKey: ["rent-details", rentId],
    queryFn: () => getRentById(rentId!),
    enabled: !!rentId && isOpen,
  });

  const { data: claimsData, isLoading: isLoadingClaims } = useQuery({
    queryKey: ["tenant-claims", rentId, claimsPage],
    queryFn: () => getTenantClaims({ rentId: rentId!, page: claimsPage, size: 8 }),
    enabled: !!rentId && isOpen,
  });

  const allClaims = claimsData?.data?.data || [];
  const claimsTotalPages = claimsData?.data?.pages || 1;

  // Filter claims by createdBy
  const userClaims = allClaims.filter((claim) => claim.createdBy === "USER");
  const ownerClaims = allClaims.filter((claim) => claim.createdBy === "OWNER");
  const claims = claimsSubTab === "user" ? userClaims : ownerClaims;

  const currency = useCountryCurrency(rent?.property?.country);

  const formatDate = (date: string) => {
    return format(new Date(date), "MMMM dd, yyyy");
  };

  const getRentStatus = () => {
    if (!rent) return { text: "", badgeColor: "bg-gray-500 text-white" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(rent.startDate);
    const end = new Date(rent.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const normalizedStatus = rent.status.toUpperCase();

    // Check if contract is terminated/cancelled
    if (normalizedStatus === "CANCELLED" || normalizedStatus === "TERMINATED") {
      return {
        text: t("status.contractTerminated"),
        badgeColor: "bg-red-500 text-white",
      };
    }

    // Check if rent has ended
    if (end < today) {
      return {
        text: t("status.rentEnded"),
        badgeColor: "bg-gray-500 text-white",
      };
    }

    // Check if rent is upcoming
    if (start > today) {
      return {
        text: t("status.upcomingDue"),
        badgeColor: "bg-main-600 text-white",
      };
    }

    // Default: show status from API
    return {
      text: t(`status.${rent.status.toLowerCase()}`),
      badgeColor: getStatusBadgeColor(rent.status),
    };
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-500 text-white";
      case "PENDING":
        return "bg-yellow-600 text-white";
      case "EXPIRED":
        return "bg-gray-500 text-white";
      case "CANCELLED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const rentStatus = getRentStatus();

  const handleDownloadContract = () => {
    if (rent?.property.contract) {
      window.open(rent.property.contract, "_blank");
    }
  };

  const handleRequestEndContract = () => {
    setShowEndContractDialog(true);
  };

  const handleRequestServices = () => {
    setShowServicesDialog(true);
  };

  const handleAddClaims = () => {
    setShowClaimsDialog(true);
  };

  // Check if claims can be added (only within first 2 hours after check-in time on start date)
  const getClaimsWindowInfo = () => {
    if (!rent) return { canAdd: false, startTime: "", endTime: "" };

    const now = new Date();
    const startDate = new Date(rent.startDate);

    // Check if today is the start date
    const isStartDate =
      now.getFullYear() === startDate.getFullYear() &&
      now.getMonth() === startDate.getMonth() &&
      now.getDate() === startDate.getDate();

    // Claims can ONLY be added on the start date
    if (!isStartDate) return { canAdd: false, startTime: "", endTime: "" };

    const checkInTime = rent.property.checkInTime;
    if (!checkInTime) return { canAdd: false, startTime: "", endTime: "" };

    // Parse checkInTime (expected format: "HH:mm" or "HH:mm:ss")
    const timeParts = checkInTime.split(":");
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    // Validate parsed values
    if (isNaN(hours) || isNaN(minutes)) return { canAdd: false, startTime: "", endTime: "" };

    // Window start: check-in time
    const windowStart = new Date(startDate);
    windowStart.setHours(hours, minutes, 0, 0);

    // Window end: check-in time + 2 hours
    const windowEnd = new Date(startDate);
    windowEnd.setHours(hours + 2, minutes, 0, 0);

    // Validate dates are valid
    if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
      return { canAdd: false, startTime: "", endTime: "" };
    }

    // Format times for display (e.g., "14:00", "16:00")
    const formatTime = (date: Date) => format(date, "HH:mm");

    return {
      canAdd: now >= windowStart && now <= windowEnd,
      startTime: formatTime(windowStart),
      endTime: formatTime(windowEnd),
    };
  };

  const claimsWindow = getClaimsWindowInfo();
  const claimsDisabled = !claimsWindow.canAdd;
  console.log(claimsWindow)

  const handleDisclaimerRequest = () => {
    setShowDisclaimerDialog(true);
  };

  const handleDownloadInvoices = async () => {
    if (!rentId) return;

    try {
      await downloadRentInvoices(rentId);
      toast.success(t("invoices-downloaded"));
    } catch (error) {
      toast.error(t("download-error"));
    }
  };

  const handleStartNavigation = () => {
    if (!rent || !rent.lat || !rent.long) return;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${rent?.lat},${rent?.long}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 bg-white dark:bg-gray-950">
        <DialogHeader className={cn(
          "w-full px-6 pt-6 pb-4 sticky top-0 inset-x-0 bg-white dark:bg-gray-950 z-10 border-b border-gray-200 dark:border-gray-800",
          isRTL && "text-right"
        )}>
          <div className={cn("flex items-start justify-between gap-4",)}>
            <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {isLoading ? t("loading") : rent ? rent.property.title : t("title")}
              </DialogTitle>
              {rent && (
                <Link
                  href={`/${locale}/properties/${rent.property._id}`}
                  className={cn(
                    "text-sm text-main-600 hover:text-main-700 dark:text-main-400 dark:hover:text-main-300 mt-1 inline-flex items-center gap-1 hover:underline",
                    isRTL && "flex-row-reverse"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("code")}: {rent.property.code}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
            <div className="flex items-center shrink-0">
              {rent && (
                <Badge className={rentStatus.badgeColor}>
                  {rentStatus.text}
                </Badge>
              )}
              {rent && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  >
                    {rent.property.contract && (
                      <>
                        <DropdownMenuItem
                          onClick={handleDownloadContract}
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                        >
                          <Download className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{t("actions.download-contract")}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={handleDownloadInvoices}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      <FileText className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{t("actions.download-invoices")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleRequestEndContract}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      <FileX className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{t("actions.request-end-contract")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleRequestServices}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      <Wrench className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{t("actions.request-services")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleAddClaims}
                      disabled={claimsDisabled}
                      className={cn(
                        "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800",
                        claimsDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <AlertCircle className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white">{t("actions.add-claims")}</span>
                        {claimsDisabled && claimsWindow.startTime && claimsWindow.endTime && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t("actions.claims-available-after", {
                              startTime: claimsWindow.startTime,
                              endTime: claimsWindow.endTime
                            })}
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDisclaimerRequest}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      <FileWarning className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{t("actions.disclaimer-request")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12 px-6 bg-white dark:bg-gray-950">
            <Spinner className="h-12 w-12 text-main-400" />
          </div>
        ) : rent ? (
          <Tabs defaultValue="details" className="px-6 pb-6 bg-white dark:bg-gray-950" dir={isRTL ? "rtl" : "ltr"}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="details" className="flex-1">
                {t("tabs.details")}
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex-1">
                {t("tabs.invoices")}
              </TabsTrigger>
              <TabsTrigger value="claims" className="flex-1">
                {t("tabs.claims")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-0">
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
                <h3 className={cn("text-base font-semibold text-gray-900 dark:text-white", isRTL && "text-right")}>
                  {t("property-details")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={cn("flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "flex-row-reverse text-right")}>
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

                  <div className={cn("flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "flex-row-reverse text-right")}>
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
                    <div className={cn("flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg col-span-2", isRTL && "flex-row-reverse text-right")}>
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
                <h3 className={cn("text-base font-semibold text-gray-900 dark:text-white", isRTL && "text-right")}>
                  {t("rental-period")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={cn("flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "flex-row-reverse text-right")}>
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

                  <div className={cn("flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "flex-row-reverse text-right")}>
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
                <h3 className={cn("text-base font-semibold text-gray-900 dark:text-white", isRTL && "text-right")}>
                  {t("rental-info")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {rent.amount && (
                    <div className={cn("flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "flex-row-reverse text-right")}>
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
                    <div className={cn("flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "flex-row-reverse text-right")}>
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
                    <div className={cn("flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg col-span-2", isRTL && "flex-row-reverse text-right")}>
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

              {rent.status === "TERMINATED" && <div className="space-y-3">
                <h3 className={cn("text-base font-semibold text-secondary-500 dark:text-white", isRTL && "text-right")}>
                  {t("end-contract-info")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {rent.endContract.reason && (
                    <div className={cn("flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "flex-row-reverse text-right")}>
                      <FaComment className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t("admin-comment")}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {rent.endContract.reason}
                        </p>
                      </div>
                    </div>
                  )}

                  {rent.endContract.file && (
                    <div className={cn("flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "flex-row-reverse text-right")}>
                      <PaperclipIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {t("file")}
                        </p>
                        <a
                          href={rent.endContract.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-main-600 hover:underline text-sm"
                        >
                          <FileText className="h-4 w-4 stroke-red-600" />
                          {t("view-file")}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>}

              {/* Owner Information */}
              {rent.owner && (
                <div className="space-y-3">
                  <h3 className={cn("text-base font-semibold text-gray-900 dark:text-white", isRTL && "text-right")}>
                    {t("owner-info")}
                  </h3>
                  <div className={cn(
                    "flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
                  )}>
                    {/* Owner Image */}
                    <div className={cn(
                      "relative h-16 w-16 shrink-0 rounded-full overflow-hidden bg-main-100 dark:bg-main-900",
                      isRTL && "order-first"
                    )}>
                      {rent.owner.image ? (
                        <Image
                          src={rent.owner.image}
                          alt={rent.owner.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <span className="text-xl font-semibold text-main-600 dark:text-main-400">
                            {rent.owner.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>


                    {/* Owner Details */}
                    <div className={cn("flex-1 min-w-0", isRTL && "order-first text-right")}>

                      <Link
                        href={`/${locale}/companies/${rent.owner._id}`}
                        className={cn(
                          "text-sm text-main-600 hover:text-main-700 dark:text-main-400 dark:hover:text-main-300 mt-1 inline-flex items-center gap-1 hover:underline",
                          isRTL && "flex-row-reverse"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {rent.owner.name}
                        </p>
                      </Link>
                      {rent.owner.phoneNumber && (
                        <div className={cn(
                          "flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400",
                          isRTL && " justify-start"
                        )}>
                          <Phone className="h-4 w-4 shrink-0" />
                          <a href={`tel:${rent.owner.phoneNumber}`} className="text-sm hover:underline" dir="ltr">{rent.owner.phoneNumber}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Services */}
              {rent.services && rent.services.length > 0 && (
                <div className="space-y-3">
                  <h3 className={cn("text-base font-semibold text-gray-900 dark:text-white", isRTL && "text-right")}>
                    {t("services")}
                  </h3>
                  <div className="space-y-2">
                    {rent.services.map((service) => (
                      <div
                        key={service._id}
                        className={cn("flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "flex-row-reverse")}
                      >
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <Wrench className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                            {service.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-main-600 dark:text-main-400">
                          {service.amount} {currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Tents/Booths (for camp/booth categories) */}
              {((rent.tents && rent.tents.length > 0) || (rent.apartments && rent.apartments.length > 0)) && rent.property.groups && (
                <div className="space-y-3">
                  <h3 className={cn("text-base font-semibold text-gray-900 dark:text-white", isRTL && "text-right")}>
                    {rent.property.category === "hotelApartment" ? t("selected-apartments") : t("selected-tents")}
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      const selectedIds = (rent.tents && rent.tents.length > 0) ? rent.tents : (rent.apartments || []);
                      const matchedGroups = rent.property.groups
                        .filter((group) =>
                          group.ids.some((id) => selectedIds.includes(id as never))
                        )
                        .map((group) => ({
                          ...group,
                          selectedCount: group.ids.filter((id) => selectedIds.includes(id as never)).length,
                        }));

                      return matchedGroups.map((group) => (
                        <div
                          key={group._id}
                          className={cn("p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "text-right")}
                        >
                          <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: group.color }}
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {group.name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                (x{group.selectedCount})
                              </span>
                            </div>
                            <span className="text-sm font-medium text-main-600 dark:text-main-400">
                              {group.price} {currency}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {group.description} • {group.area} m²
                          </p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Selected Apartments (for hotelApartment category with property.apartments) */}
              {rent.apartments && rent.apartments.length > 0 && rent.property.apartments && !rent.property.groups && (
                <div className="space-y-3">
                  <h3 className={cn("text-base font-semibold text-gray-900 dark:text-white", isRTL && "text-right")}>
                    {t("selected-apartments")}
                  </h3>
                  <div className="space-y-2">
                    {rent.property.apartments
                      .filter((apt) => rent.apartments!.includes(apt._id))
                      .map((apartment) => (
                        <div
                          key={apartment._id}
                          className={cn("p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg", isRTL && "text-right")}
                        >
                          <div className={cn("flex items-center justify-between mb-1", isRTL && "flex-row-reverse")}>
                            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                              <Hotel className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {apartment.name}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-main-600 dark:text-main-400">
                              {apartment.price} {currency}
                            </span>
                          </div>
                          {(apartment.description || apartment.area) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {apartment.description}{apartment.description && apartment.area ? " • " : ""}{apartment.area ? `${apartment.area} m²` : ""}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Pickup Location - Movable Campers Only */}
              {rent.property.category === "camper" &&
                rent.property.type === "movable" &&
                rent.lat &&
                rent.long && (
                  <div className="space-y-3">
                    <h3 className={cn("text-base font-semibold text-gray-900 dark:text-white", isRTL && "text-right")}>
                      {t("pickup-location")}
                    </h3>
                    <Button
          onClick={handleStartNavigation}
          className="mt-6 bg-main-600 text-white hover:bg-main-500 justify-center gap-2 font-semibold shadow-sm hover:shadow-md transition-all"
        >
          <Navigation className="h-4 w-4" />
          {t("start-navigation")}
        </Button>
                    <PickupLocationMapView
                      latitude={Number(rent.lat)}
                      longitude={Number(rent.long)}
                      zoom={15}
                      height="300px"
                    />
                  </div>
                )}
            </TabsContent>

            <TabsContent value="invoices" className="mt-0">
              <RentInvoicesTab
                rentId={rent._id}
                propertyCountry={rent.property.country}
              />
            </TabsContent>

            <TabsContent value="claims" className="mt-0">
              {/* Sub-tabs for USER and OWNER claims */}
              <div className="mb-4">
                <div className={cn(
                  "inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-100 dark:bg-gray-800"
                )}>
                  <button
                    onClick={() => {
                      setClaimsSubTab("user");
                      setClaimsPage(1);
                    }}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      claimsSubTab === "user"
                        ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {t("claims.my-claims")}
                  </button>
                  <button
                    onClick={() => {
                      setClaimsSubTab("owner");
                      setClaimsPage(1);
                    }}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                      claimsSubTab === "owner"
                        ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {t("claims.owner-claims")}
                  </button>
                </div>
              </div>

              {isLoadingClaims ? (
                <div className="flex justify-center py-12">
                  <Spinner className="h-8 w-8 text-main-400" />
                </div>
              ) : claims.length === 0 ? (
                <div className={cn(
                  "flex flex-col items-center justify-center py-12 text-center",
                  isRTL && "text-right"
                )}>
                  <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {claimsSubTab === "user" ? t("claims.no-user-claims") : t("claims.no-owner-claims")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div
                      key={claim._id}
                      className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
                    >
                      <div className={cn(
                        "flex items-start gap-3",
                        isRTL && "flex-row-reverse"
                      )}>
                        <div className="shrink-0 mt-0.5">
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                          <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                            {claim.claim}
                          </p>
                          {claim.comment && (
                            <div className={cn(
                              "mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-2 border-gray-300 dark:border-gray-600",
                              isRTL && "border-l-0 border-r-2"
                            )}>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {t("claims.comment")}
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {claim.comment}
                              </p>
                            </div>
                          )}
                          <div className={cn(
                            "flex items-center gap-4 mt-3",
                            isRTL && "flex-row-reverse justify-end"
                          )}>
                            {claim.status && (
                              <Badge
                                className={cn(
                                  claim.status.toLowerCase() === "resolved"
                                    ? "bg-green-500 text-white"
                                    : claim.status.toLowerCase() === "pending"
                                      ? "bg-yellow-500 text-white"
                                      : "bg-gray-500 text-white"
                                )}
                              >
                                {t(`claims.status.${claim.status.toLowerCase()}`)}
                              </Badge>
                            )}
                            {claim.attachment && (
                              <a
                                href={claim.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "inline-flex items-center gap-1 text-sm text-main-600 hover:text-main-700 dark:text-main-400 dark:hover:text-main-300 hover:underline",
                                  isRTL && "flex-row-reverse"
                                )}
                              >
                                <Paperclip className="h-4 w-4" />
                                {t("claims.view-attachment")}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {claimsTotalPages > 1 && (
                    <PaginationControls
                      currentPage={claimsPage}
                      totalPages={claimsTotalPages}
                      onPageChange={setClaimsPage}
                    />
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="px-6 pb-6 text-center text-gray-500 dark:text-gray-400">
            {t("no-data")}
          </div>
        )}

        {/* Request Services Dialog */}
        <RequestServicesDialog
          rentId={rentId}
          open={showServicesDialog}
          onOpenChange={setShowServicesDialog}
        />

        {/* Request End Contract Dialog */}
        <RequestEndContractDialog
          rentId={rentId}
          open={showEndContractDialog}
          onOpenChange={setShowEndContractDialog}
        />

        {/* Add Claims Dialog */}
        <AddClaimsDialog
          rentId={rentId}
          open={showClaimsDialog}
          onOpenChange={setShowClaimsDialog}
        />

        {/* Disclaimer Request Dialog */}
        <DisclaimerRequestDialog
          rentId={rentId}
          open={showDisclaimerDialog}
          onOpenChange={setShowDisclaimerDialog}
        />
      </DialogContent>
    </Dialog>
  );
}
