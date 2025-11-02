"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, Calendar, MapPin, Home, Wrench, DollarSign, FileCheck, Megaphone, Clock, FileX } from "lucide-react";
import { useSession } from "next-auth/react";

import Typography from "@/components/shared/typography";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetRequests } from "@/hooks/use-user";
import { Spinner } from "@/components/ui/spinner";
import PaginationControls from "@/components/shared/pagination-controls";
import Image from "next/image";
import AdDetailsDialog from "@/components/dialogs/ad-details-dialog";
import PaymentMethodDialog from "@/components/dialogs/payment-method-dialog";
import { Button } from "@/components/ui/button";
import { usePayInvoice } from "@/hooks/use-invoices";
import { toast } from "sonner";

type TabType = "tours" | "rent" | "service" | "installments" | "disclaimers" | "ads" | "extend-invoices" | "end-contracts";

const getTabEndpoints = (userId?: string): Record<TabType, string> => ({
  tours: "/tours",
  rent: "/requests/rents",
  service: "/requests/services",
  installments: "/installments",
  disclaimers: "/disclaimers",
  ads: `/ads?user=${userId || ""}`,
  "extend-invoices": "/invoices/extends",
  "end-contracts": "/end-contracts",
});

export default function MyRequestsPage() {
  const t = useTranslations("User.MyRequests");
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("tours");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceAmount, setSelectedInvoiceAmount] = useState<number | null>(null);

  // Payment mutation for extend invoices
  const payInvoiceMutation = usePayInvoice();

  // Get user ID from session
  const userId = session?.user?.id;
  const tabEndpoints = getTabEndpoints(userId);

  // Single query that refetches when endpoint or page changes
  const currentEndpoint = tabEndpoints[activeTab];
  const { data, isLoading } = useGetRequests(currentEndpoint, currentPage);

  console.log(data)

  // Reset to page 1 when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Smooth scroll to top when page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle payment for rejected extend invoices
  const handlePayInvoice = (invoiceId: string, amount: number) => {
    setSelectedInvoiceId(invoiceId);
    setSelectedInvoiceAmount(amount);
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async (paymentMethod: string) => {
    if (!selectedInvoiceId) return;

    try {
      const response = await payInvoiceMutation.mutateAsync({
        paymentMethod,
        invoiceId: selectedInvoiceId,
      });

      if (response.data?.PayUrl) {
        const paymentWindow = window.open(
          response.data.PayUrl,
          "_blank",
          "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        if (!paymentWindow) {
          toast.error(t("payment-failed"));
          window.location.href = response.data.PayUrl;
        } else {
          const checkWindowClosed = setInterval(() => {
            if (paymentWindow.closed) {
              clearInterval(checkWindowClosed);
              // Refresh data after payment window closes
              window.location.reload();
            }
          }, 1000);
        }
      }
    } catch (error) {
      toast.error(t("payment-failed"));
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    switch (normalizedStatus) {
      case "approved":
      case "accepted":
      case "completed":
      case "confirmed":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
      case "under_review":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "rejected":
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const renderRequestCard = (request: any, icon: React.ReactNode) => {
    // Handle extend invoices which have nested invoice.property structure
    const isExtendInvoice = activeTab === "extend-invoices";
    // Handle end contracts which have nested rent.property structure
    const isEndContract = activeTab === "end-contracts";
    const property = isExtendInvoice
      ? request.invoice?.property
      : isEndContract
        ? request.rent?.property
        : request.property;

    const propertyTitle = property?.title || request.name || request.title || t("request-title");
    const propertyLocation = property
      ? `${property.city || ""}, ${property.region || ""}`.trim().replace(/^,|,$/g, "")
      : null;

    // Check if this is an ad with a comment (for green border)
    const hasAdComment = activeTab === "ads" && request.comment;

    // Check if this is an ad (make it clickable)
    const isAd = activeTab === "ads";

    return (
      <div
        key={request._id}
        onClick={() => isAd && setSelectedAdId(request._id)}
        className={`rounded-lg border bg-white p-6 hover:shadow-md transition-shadow ${
          hasAdComment ? "border-green-500 border-2" : "border-gray-200"
        } ${isAd ? "cursor-pointer" : ""}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-main-100 shrink-0">
              {icon}
            </div>
            <div>
              <Typography variant="body-lg-medium" as="h5" className="font-bold mb-1">
                {propertyTitle}
              </Typography>
              {request.name && request.property && (
                <Typography variant="body-sm" as="p" className="text-gray-600 mb-1">
                  {request.name}
                </Typography>
              )}
              <Typography variant="body-sm" as="p" className="text-gray-500">
                {isExtendInvoice && request.invoice?.ID ? `${t("invoice-id")}: ${request.invoice.ID}` : `${t("request-id")}: ${request._id.slice(-8).toUpperCase()}`}
              </Typography>
              {property?.code && (
                <Typography variant="body-sm" as="p" className="text-gray-400">
                  {property.code}
                </Typography>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {request.status && (
              <span
                className={`inline-block rounded-full border px-4 py-1 text-sm font-medium whitespace-nowrap ${getStatusColor(
                  request.status
                )}`}
              >
                {request.status}
              </span>
            )}
            {request.ownerStatus && request.userStatus && (
              <div className="flex flex-col gap-1 text-xs">
                <span className={`inline-block rounded-full border px-3 py-1 font-medium whitespace-nowrap ${getStatusColor(request.ownerStatus)}`}>
                  {t("owner")}: {request.ownerStatus}
                </span>
                {/* Hide user status if owner status is rejected in installments */}
                {!(activeTab === "installments" && request.ownerStatus?.toLowerCase() === "rejected") && (
                  <span className={`inline-block rounded-full border px-3 py-1 font-medium whitespace-nowrap ${getStatusColor(request.userStatus)}`}>
                    {t("user")}: {request.userStatus}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {propertyLocation && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {propertyLocation}
              </Typography>
            </div>
          )}

          {request.date && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {formatDate(request.date)}
              </Typography>
            </div>
          )}

          {request.rent?.startDate && !request.installmentPeriod && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {formatDate(request.rent.startDate)} - {formatDate(request.rent.endDate)}
                {request.rent.rentType && ` (${request.rent.rentType})`}
              </Typography>
            </div>
          )}

          {request.mobileNumber && (
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {request.mobileNumber}
              </Typography>
            </div>
          )}

          {request.amount && !isAd && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {request.amount} {t("currency")}
              </Typography>
            </div>
          )}

          {/* Ad specific fields */}
          {isAd && request.price && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {request.price} {t("currency")} / {request.priceType}
              </Typography>
            </div>
          )}

          {request.property?.price && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {t("total")}: {request.property.price} {t("currency")}
              </Typography>
            </div>
          )}

          {request.installmentPeriod && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {request.installmentPeriod} {t("months")} ({request.installmentType || t("not-available")})
              </Typography>
            </div>
          )}

          {request.startDate && request.endDate && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {formatDate(request.startDate)} - {formatDate(request.endDate)}
              </Typography>
            </div>
          )}

          {/* Extend Invoice specific fields */}
          {isExtendInvoice && request.extendTo && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {t("extend-to")}: {formatDate(request.extendTo)}
              </Typography>
            </div>
          )}

          {isExtendInvoice && request.invoice?.userAmount && (
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {t("invoice-amount")}: {request.invoice.userAmount} {t("currency")}
              </Typography>
            </div>
          )}

          {isExtendInvoice && request.invoice?.date && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {t("original-date")}: {formatDate(request.invoice.date)}
              </Typography>
            </div>
          )}

          {request.createdAt && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span" className="text-gray-400">
                {t("created")}: {formatDate(request.createdAt)}
              </Typography>
            </div>
          )}
        </div>

        {request.owner && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
            {request.owner.image ? (
              <Image
                src={request.owner.image}
                alt={request.owner.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-main-100 flex items-center justify-center">
                <Home className="h-5 w-5 text-main-600" />
              </div>
            )}
            <div>
              <Typography variant="body-sm" as="p" className="font-medium">
                {request.owner.name}
              </Typography>
              <Typography variant="body-sm" as="p" className="text-gray-500">
                {request.owner.ownerType}
              </Typography>
            </div>
          </div>
        )}

        {request.ownerComment && (
          <Typography variant="body-sm" as="p" className="text-gray-600 mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded italic">
            <span className="font-semibold">{t("owner-comment")}:</span> {request.ownerComment}
          </Typography>
        )}

        {request.comment && activeTab === "ads" && (
          <Typography variant="body-sm" as="p" className="text-gray-600 mt-3 p-3 bg-green-50 border-l-4 border-green-400 rounded">
            <span className="font-semibold">{t("admin-comment")}:</span> {request.comment}
          </Typography>
        )}

        {request.reason && (
          <Typography variant="body-sm" as="p" className="text-gray-600 mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <span className="font-semibold">{t("reason")}:</span> {request.reason}
          </Typography>
        )}

        {request.description && (
          <Typography variant="body-sm" as="p" className="text-gray-600 mt-3">
            {request.description}
          </Typography>
        )}

        {/* Pay Now button for rejected extend invoices */}
        {isExtendInvoice && request.status?.toLowerCase() === "rejected" && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {request.invoice?._id ? (
              <Button
                onClick={() => handlePayInvoice(request.invoice._id, request.invoice.amount)}
                className="w-full bg-main-600 hover:bg-main-700 text-white font-semibold"
              >
                {payInvoiceMutation.isPending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  t("pay-now")
                )}
              </Button>
            ) : (
              <Typography variant="body-sm" as="p" className="text-gray-600 text-center p-3 bg-red-50 border border-red-200 rounded">
                {t("invoice-not-available")}
              </Typography>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderEmptyState = (icon: React.ReactNode, message: string) => (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <Typography variant="body-lg-medium" as="p" className="text-gray-500 mb-2">
        {message}
      </Typography>
      <Typography variant="body-sm" as="p" className="text-gray-400">
        {t("no-requests-description")}
      </Typography>
    </div>
  );

  // Get the appropriate icon and empty message based on active tab
  const getTabConfig = (tab: TabType) => {
    switch (tab) {
      case "tours":
        return {
          icon: <Calendar className="h-6 w-6 text-main-600" />,
          emptyIcon: <Calendar className="h-8 w-8 text-gray-400" />,
          emptyMessage: t("no-tours"),
        };
      case "rent":
        return {
          icon: <Home className="h-6 w-6 text-main-600" />,
          emptyIcon: <Home className="h-8 w-8 text-gray-400" />,
          emptyMessage: t("no-rent"),
        };
      case "service":
        return {
          icon: <Wrench className="h-6 w-6 text-main-600" />,
          emptyIcon: <Wrench className="h-8 w-8 text-gray-400" />,
          emptyMessage: t("no-service"),
        };
      case "installments":
        return {
          icon: <DollarSign className="h-6 w-6 text-main-600" />,
          emptyIcon: <DollarSign className="h-8 w-8 text-gray-400" />,
          emptyMessage: t("no-installments"),
        };
      case "disclaimers":
        return {
          icon: <FileCheck className="h-6 w-6 text-main-600" />,
          emptyIcon: <FileCheck className="h-8 w-8 text-gray-400" />,
          emptyMessage: t("no-disclaimers"),
        };
      case "ads":
        return {
          icon: <Megaphone className="h-6 w-6 text-main-600" />,
          emptyIcon: <Megaphone className="h-8 w-8 text-gray-400" />,
          emptyMessage: t("no-ads"),
        };
      case "extend-invoices":
        return {
          icon: <Clock className="h-6 w-6 text-main-600" />,
          emptyIcon: <Clock className="h-8 w-8 text-gray-400" />,
          emptyMessage: t("no-extend-invoices"),
        };
      case "end-contracts":
        return {
          icon: <FileX className="h-6 w-6 text-main-600" />,
          emptyIcon: <FileX className="h-8 w-8 text-gray-400" />,
          emptyMessage: t("no-end-contracts"),
        };
    }
  };

  const tabConfig = getTabConfig(activeTab);
  const requests = data?.data?.data || [];
  const totalPages = data?.data?.pages || 1;
  const itemsCount = data?.data?.itemsCount || 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Typography variant="h3" as="h3" className="font-bold">
          {t("title")}
        </Typography>
        <Typography variant="body-md" as="p" className="text-gray-500">
          {t("description")}
        </Typography>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger
            value="tours"
            className="data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.tours")}
          </TabsTrigger>
          <TabsTrigger
            value="rent"
            className="data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.rent")}
          </TabsTrigger>
          <TabsTrigger
            value="service"
            className="data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.service")}
          </TabsTrigger>
          <TabsTrigger
            value="installments"
            className="data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.installments")}
          </TabsTrigger>
          <TabsTrigger
            value="disclaimers"
            className="data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.disclaimers")}
          </TabsTrigger>
          <TabsTrigger
            value="ads"
            className="data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.ads")}
          </TabsTrigger>
          <TabsTrigger
            value="extend-invoices"
            className="data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.extend-invoices")}
          </TabsTrigger>
          <TabsTrigger
            value="end-contracts"
            className="data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.end-contracts")}
          </TabsTrigger>
        </TabsList>

        {/* Single Tab Content - dynamically renders based on activeTab */}
        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-12 w-12 text-main-400" />
            </div>
          ) : requests.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <Typography variant="body-sm" as="p" className="text-gray-500">
                  {t("showing-page", { currentPage, totalPages, itemsCount })}
                </Typography>
              </div>
              <div className="space-y-4">
                {requests.map((request: any) =>
                  renderRequestCard(request, tabConfig.icon)
                )}
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                disabled={isLoading}
              />
            </>
          ) : (
            renderEmptyState(tabConfig.emptyIcon, tabConfig.emptyMessage)
          )}
        </div>
      </Tabs>

      {/* Ad Details Dialog */}
      <AdDetailsDialog
        adId={selectedAdId}
        open={!!selectedAdId}
        onOpenChange={(open) => !open && setSelectedAdId(null)}
      />

      {/* Payment Method Dialog */}
      <PaymentMethodDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onConfirm={handleConfirmPayment}
        amount={selectedInvoiceAmount || undefined}
        currency="KWD"
      />
    </div>
  );
}
