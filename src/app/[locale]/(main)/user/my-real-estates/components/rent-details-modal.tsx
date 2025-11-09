"use client";

import { useState } from "react";
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
  MoreVertical,
  Download,
  FileX,
  Wrench,
  AlertCircle,
  FileWarning,
  FileText,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getRentById } from "@/lib/services/api/rents";
import { downloadRentInvoices } from "@/lib/services/api/invoices";
import { useCountryCurrency } from "@/hooks/use-country-currency";
import PickupLocationMapView from "@/components/ui/pickup-location-map-view";
import RentInvoicesTab from "./rent-invoices-tab";
import RequestEndContractDialog from "./request-end-contract-dialog";
import AddClaimsDialog from "./add-claims-dialog";
import DisclaimerRequestDialog from "./disclaimer-request-dialog";
import RequestServicesDialog from "./request-services-dialog";
import { toast } from "sonner";

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
  const [showEndContractDialog, setShowEndContractDialog] = useState(false);
  const [showClaimsDialog, setShowClaimsDialog] = useState(false);
  const [showDisclaimerDialog, setShowDisclaimerDialog] = useState(false);
  const [showServicesDialog, setShowServicesDialog] = useState(false);

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
            <div className="flex items-center gap-2 shrink-0">
              {rent && (
                <Badge className={`${getStatusColor(rent.status)}`}>
                  {t(`status.${rent.status.toLowerCase()}`)}
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
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      <AlertCircle className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{t("actions.add-claims")}</span>
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
          <Tabs defaultValue="details" className="px-6 pb-6 bg-white dark:bg-gray-950">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="details" className="flex-1">
                {t("tabs.details")}
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex-1">
                {t("tabs.invoices")}
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

            {/* Pickup Location - Movable Campers Only */}
            {rent.property.category === "camper" &&
             rent.property.type === "movable" &&
             rent.lat &&
             rent.long && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("pickup-location")}
                </h3>
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
