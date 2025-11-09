"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Home,
  DollarSign,
  Download,
  MoreVertical,
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useInstallmentDetails } from "@/hooks/use-installments";
import { downloadInstallmentInvoices } from "@/lib/services/api/installments";
import InstallmentInvoicesTab from "./installment-invoices-tab";
import { toast } from "sonner";

interface InstallmentDetailsModalProps {
  installmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallmentDetailsModal({
  installmentId,
  isOpen,
  onClose,
}: InstallmentDetailsModalProps) {
  const t = useTranslations("User.MyRealEstates.InstallmentDetailsModal");
  const tCommon = useTranslations("General");

  const { data, isLoading } = useInstallmentDetails(installmentId);
  const installment = data?.data;

  const formatDate = (date: string) => {
    return format(new Date(date), "MMMM dd, yyyy");
  };

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

  const handleDownloadContract = () => {
    if (installment?.contract) {
      window.open(installment.contract, "_blank");
    }
  };

  const handleDownloadInvoices = async () => {
    if (!installmentId) return;

    try {
      await downloadInstallmentInvoices(installmentId);
      toast.success(t("invoices-downloaded"));
    } catch (error) {
      toast.error(t("download-error"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-gray-950">
        <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 bg-white dark:bg-gray-950 z-10 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {isLoading ? t("loading") : installment ? installment.property.title : t("title")}
              </DialogTitle>
              {installment && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t("code")}: {installment.property.code}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {installment && (
                <>
                  <Badge className={getStatusColor(installment.ownerStatus)}>
                    {t("owner-status")}: {normalizeStatus(installment.ownerStatus)}
                  </Badge>
                  <Badge className={getStatusColor(installment.userStatus)}>
                    {t("user-status")}: {normalizeStatus(installment.userStatus)}
                  </Badge>
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
                      {installment.contract && (
                        <>
                          <DropdownMenuItem
                            onClick={handleDownloadContract}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                          >
                            <Download className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-white">{t("download-contract")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={handleDownloadInvoices}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
                      >
                        <FileText className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{t("download-invoices")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12 px-6 bg-white dark:bg-gray-950">
            <Spinner className="h-12 w-12 text-main-400" />
          </div>
        ) : installment ? (
          <Tabs defaultValue="details" className="px-6 pb-6 bg-white dark:bg-gray-950">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="details" className="flex-1">
                {t("tabs.details")}
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex-1">
                {t("tabs.invoices")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Property Details */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {t("property-details")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("location")}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {installment.property.city}, {installment.property.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t("property-price")}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {installment.property.price?.toLocaleString()} {tCommon("kwd")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Installment Details */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {t("installment-details")}
                    </h3>
                    <div className="space-y-3">
                      {installment.amount && (
                        <div className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("monthly-payment")}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {installment.amount} {tCommon("kwd")}
                            </p>
                          </div>
                        </div>
                      )}
                      {installment.installmentPeriod && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("period")}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {installment.installmentPeriod} {t("months")}
                            </p>
                          </div>
                        </div>
                      )}
                      {installment.installmentType && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("payment-type")}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {getInstallmentTypeLabel(installment.installmentType)}
                            </p>
                          </div>
                        </div>
                      )}
                      {installment.installmentPlan && (
                        <div className="flex items-start gap-3">
                          <Home className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("plan")}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {installment.installmentPlan}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Dates */}
                  {installment.startDate && installment.endDate && (
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {t("dates")}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("start-date")}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(installment.startDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t("end-date")}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(installment.endDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Owner Details */}
                  {installment.owner && (
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {t("owner-details")}
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{t("name")}</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {installment.owner.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{t("phone")}</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {installment.owner.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="mt-0">
              <InstallmentInvoicesTab installmentId={installment._id} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="px-6 pb-6 text-center text-gray-500 dark:text-gray-400">
            {t("no-data")}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
