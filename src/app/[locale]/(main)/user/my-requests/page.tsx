"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Calendar, Home, Wrench, DollarSign, FileCheck, Megaphone, Clock, FileX, Wallet } from "lucide-react";

import Typography from "@/components/shared/typography";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetRequests } from "@/hooks/use-user";
import { Spinner } from "@/components/ui/spinner";
import PaginationControls from "@/components/shared/pagination-controls";
import { cn } from "@/lib/utils";
import AdDetailsDialog from "@/components/dialogs/ad-details-dialog";
import PaymentResultDialog from "@/components/dialogs/payment-result-dialog";
import InstallmentDetailsDialog from "@/components/dialogs/installment-details-dialog";
import RequestDetailsModal from "./components/request-details-modal";
import { usePayInvoice } from "@/hooks/use-invoices";
import { toast } from "sonner";
import { useCountries } from "@/hooks/use-countries";
import ConfirmationDialog from "@/components/dialogs/confirmation-dialog";
import { useUpdatePropertyUserStatus } from "@/hooks/use-properties";
import {
  AdRequestCard,
  TourRequestCard,
  RentRequestCard,
  ServiceRequestCard,
  DisclaimerRequestCard,
  InstallmentRequestCard,
  ExtendInvoiceRequestCard,
  EndContractRequestCard,
  RentalCollectionRequestCard,
} from "./components/cards";

type TabType = "tours" | "rent" | "service" | "installments" | "disclaimers" | "ads" | "extend-invoices" | "end-contracts" | "rental-collection";

const getTabEndpoints = (userId?: string): Record<TabType, string> => ({
  tours: "/tours",
  rent: "/requests/rents",
  service: "/requests/services",
  installments: "/installments",
  disclaimers: "/disclaimers",
  ads: `/ads?user=${userId || ""}`,
  "extend-invoices": "/invoices/extends",
  "end-contracts": "/end-contracts",
  "rental-collection": "/properties/rental_requests",
});

export default function MyRequestsPage() {
  const t = useTranslations("User.MyRequests");
  const locale = useLocale();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<TabType>("ads");
  const [showPaymentResult, setShowPaymentResult] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Handle tab query parameter (only 'rent' tab) and isSuccess
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const isSuccess = searchParams.get("isSuccess");

    // Only handle tab=rent
    if (tabParam === "rent") {
      setActiveTab("rent");
    }

    if (isSuccess !== null) {
      setPaymentSuccess(isSuccess === "true");
      setShowPaymentResult(true);
    }
  }, [searchParams]);

  const handleClosePaymentResult = () => {
    setShowPaymentResult(false);
    // Clean up both tab and isSuccess query params from URL
    router.replace(pathname, { scroll: false });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | null;
    propertyId: string | null;
    propertyTitle: string | null;
  }>({
    open: false,
    action: null,
    propertyId: null,
    propertyTitle: null,
  });
  const [requestDetailsId, setRequestDetailsId] = useState<string | null>(null);
  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Payment mutation for extend invoices
  const payInvoiceMutation = usePayInvoice();

  // Update property user status mutation
  const updateUserStatusMutation = useUpdatePropertyUserStatus();

  // Get countries data for currency lookup
  const { data: countries } = useCountries();

  // Helper function to get currency from country code
  const getCurrency = (countryCode?: string): string => {
    if (!countries || !countryCode) {
      return "KWD"; // Default currency
    }
    const country = countries.find(
      (c) => c.code?.toUpperCase() === countryCode.toUpperCase()
    );
    return country?.currency || "KWD";
  };

  // Get user ID from session
  const userId = session?.user?.id;
  const tabEndpoints = getTabEndpoints(userId);

  // Single query that refetches when endpoint or page changes
  const currentEndpoint = tabEndpoints[activeTab];
  const { data, isLoading } = useGetRequests(currentEndpoint, currentPage);

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

  // Handle approve/reject rental collection property
  const handleApproveReject = (action: "approve" | "reject", propertyId: string, propertyTitle: string) => {
    setConfirmationDialog({
      open: true,
      action,
      propertyId,
      propertyTitle,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog.propertyId || !confirmationDialog.action) return;

    try {
      await updateUserStatusMutation.mutateAsync({
        propertyId: confirmationDialog.propertyId,
        status: confirmationDialog.action === "approve" ? "APPROVED" : "REFUSED",
      });

      toast.success(
        confirmationDialog.action === "approve"
          ? t("rental-collection-approved")
          : t("rental-collection-rejected")
      );

      setConfirmationDialog({
        open: false,
        action: null,
        propertyId: null,
        propertyTitle: null,
      });
    } catch (error) {
      toast.error(t("action-failed"));
    }
  };

  // Handle payment for rejected extend invoices from modal
  const handlePayInvoiceFromModal = async (invoiceId: string, paymentMethod: string) => {
    try {
      const response = await payInvoiceMutation.mutateAsync({
        paymentMethod,
        invoiceId,
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

  const renderRequestCard = (request: any) => {
    const commonProps = {
      request,
      locale,
      getCurrency,
    };

    switch (activeTab) {
      case "tours":
        return (
          <TourRequestCard
            key={request._id}
            {...commonProps}
            onCardClick={() => {
              setRequestDetailsId(request._id);
              setRequestDetailsOpen(true);
            }}
          />
        );

      case "rent":
        return (
          <RentRequestCard
            key={request._id}
            {...commonProps}
            onCardClick={() => {
              setRequestDetailsId(request._id);
              setRequestDetailsOpen(true);
            }}
          />
        );

      case "service":
        return (
          <ServiceRequestCard
            key={request._id}
            {...commonProps}
            onCardClick={() => {
              setRequestDetailsId(request._id);
              setRequestDetailsOpen(true);
            }}
          />
        );

      case "ads":
        return (
          <AdRequestCard
            key={request._id}
            {...commonProps}
            onCardClick={() => setSelectedAdId(request._id)}
          />
        );

      case "installments":
        return (
          <InstallmentRequestCard
            key={request._id}
            {...commonProps}
            onCardClick={() => {
              setSelectedInstallmentId(request._id)
            }}
          />
        );

      case "disclaimers":
        return (
          <DisclaimerRequestCard
            key={request._id}
            {...commonProps}
            onCardClick={() => {
              setRequestDetailsId(request._id);
              setRequestDetailsOpen(true);
            }}
          />
        );

      case "extend-invoices":
        return (
          <ExtendInvoiceRequestCard
            key={request._id}
            {...commonProps}
            onCardClick={() => {
              setRequestDetailsId(request._id);
              setRequestDetailsOpen(true);
            }}
          />
        );

      case "end-contracts":
        return (
          <EndContractRequestCard
            key={request._id}
            {...commonProps}
            onCardClick={() => {
              setRequestDetailsId(request._id);
              setRequestDetailsOpen(true);
            }}
          />
        );

      case "rental-collection":
        return (
          <RentalCollectionRequestCard
            key={request._id}
            {...commonProps}
            onCardClick={() => {
              setRequestDetailsId(request._id);
              setSelectedRequest(request);
              setRequestDetailsOpen(true);
            }}
          />
        );

      default:
        return null;
    }
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
      case "rental-collection":
        return {
          icon: <Wallet className="h-6 w-6 text-main-600" />,
          emptyIcon: <Wallet className="h-8 w-8 text-gray-400" />,
          emptyMessage: t("no-rental-collection"),
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
        <TabsList className={cn("flex w-full flex-wrap gap-2 h-auto p-2", locale === "ar" && "flex-row-reverse")}>
          <TabsTrigger
            value="ads"
            className="px-4 py-2 cursor-pointer data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.ads")}
          </TabsTrigger>
          <TabsTrigger
            value="tours"
            className="px-4 py-2 cursor-pointer data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.tours")}
          </TabsTrigger>
          <TabsTrigger
            value="rent"
            className="px-4 py-2 cursor-pointer data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.rent")}
          </TabsTrigger>
          <TabsTrigger
            value="installments"
            className="px-4 py-2 cursor-pointer data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.installments")}
          </TabsTrigger>
          <TabsTrigger
            value="service"
            className="px-4 py-2 cursor-pointer data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.service")}
          </TabsTrigger>
          <TabsTrigger
            value="disclaimers"
            className="px-4 py-2 cursor-pointer data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.disclaimers")}
          </TabsTrigger>
          <TabsTrigger
            value="extend-invoices"
            className="px-4 py-2 cursor-pointer data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.extend-invoices")}
          </TabsTrigger>
          <TabsTrigger
            value="rental-collection"
            className="px-4 py-2 cursor-pointer data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            {t("tabs.rental-collection")}
          </TabsTrigger>
          <TabsTrigger
            value="end-contracts"
            className="px-4 py-2 cursor-pointer data-[state=active]:bg-main-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
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
              <div className={cn("mb-4 flex items-center justify-between", locale === "ar" && "flex-row-reverse")}>
                <Typography variant="body-sm" as="p" className={cn("text-gray-500", locale === "ar" && "text-right")}>
                  {t("showing-page", { currentPage, totalPages, itemsCount })}
                </Typography>
              </div>
              <div className="space-y-4">
                {requests.map((request: any) =>
                  renderRequestCard(request)
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

      {/* Installment Details Dialog */}
      <InstallmentDetailsDialog
        installmentId={selectedInstallmentId}
        open={!!selectedInstallmentId}
        onOpenChange={(open) => !open && setSelectedInstallmentId(null)}
      />

      {/* Generic Request Details Modal */}
      <RequestDetailsModal
        isOpen={requestDetailsOpen}
        onClose={() => {
          setRequestDetailsOpen(false);
          setRequestDetailsId(null);
          setSelectedRequest(null);
        }}
        requestId={requestDetailsId}
        endpoint={currentEndpoint}
        requestType={activeTab}
        request={selectedRequest}
        onPayInvoice={handlePayInvoiceFromModal}
        isPaymentPending={payInvoiceMutation.isPending}
        onApproveReject={handleApproveReject}
        isActionPending={updateUserStatusMutation.isPending}
        pendingAction={confirmationDialog.action}
      />

      {/* Rental Collection Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          !open &&
          setConfirmationDialog({
            open: false,
            action: null,
            propertyId: null,
            propertyTitle: null,
          })
        }
        title={
          confirmationDialog.action === "approve"
            ? t("confirmation-tenant.approve.title")
            : t("confirmation-tenant.reject.title")
        }
        description={
          confirmationDialog.action === "approve"
            ? t("confirmation-tenant.approve.description", {
                property: confirmationDialog.propertyTitle ?? "",
              })
            : t("confirmation-tenant.reject.description", {
                property: confirmationDialog.propertyTitle ?? "",
              })
        }
        cancelText={t("confirmation.cancel")}
        confirmText={t("confirmation.confirm")}
        onConfirm={handleConfirmAction}
        isLoading={updateUserStatusMutation.isPending}
        variant={confirmationDialog.action === "reject" ? "destructive" : "default"}
      />

      <PaymentResultDialog
        open={showPaymentResult}
        onClose={handleClosePaymentResult}
        isSuccess={paymentSuccess}
      />
    </div>
  );
}
