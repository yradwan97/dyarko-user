"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { Building2, KeyRound, CreditCard } from "lucide-react";

import Typography from "@/components/shared/typography";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRents } from "@/lib/services/api/rents";
import { useApprovedInstallments } from "@/hooks/use-installments";
import RentCard from "./components/rent-card";
import InstallmentCard from "./components/installment-card";
import RentDetailsModal from "./components/rent-details-modal";
import InstallmentDetailsModal from "./components/installment-details-modal";
import PaginationControls from "@/components/shared/pagination-controls";
import { cn } from "@/lib/utils";

export default function MyRealEstatesPage() {
  const t = useTranslations("User.MyRealEstates");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"rents" | "installments">("rents");
  const [selectedRentId, setSelectedRentId] = useState<string | null>(null);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: rentsData, isLoading: isLoadingRents } = useQuery({
    queryKey: ["my-rents", currentPage],
    queryFn: () => getRents(currentPage),
    enabled: activeTab === "rents",
  });

  const { data: installmentsData, isLoading: isLoadingInstallments } = useApprovedInstallments(currentPage);

  const rents = rentsData?.data?.data || [];
  const installments = installmentsData?.data?.data || [];
  const totalPages = activeTab === "rents"
    ? rentsData?.data?.pages || 1
    : installmentsData?.data?.pages || 1;

  const handleRentClick = (rentId: string) => {
    setSelectedRentId(rentId);
    setIsModalOpen(true);
  };

  const handleInstallmentClick = (installmentId: string) => {
    setSelectedInstallmentId(installmentId);
    setIsInstallmentModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRentId(null);
  };

  const handleCloseInstallmentModal = () => {
    setIsInstallmentModalOpen(false);
    setSelectedInstallmentId(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "rents" | "installments");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Typography variant="h3" as="h3" className="font-bold">
          {t("title")}
        </Typography>
        <Typography variant="body-md" as="p" className="text-gray-500 dark:text-gray-400">
          {t("description")}
        </Typography>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className={cn("grid w-full grid-cols-2 max-w-md mx-auto", locale === "ar" && "flex-row-reverse")}>
          <TabsTrigger value="rents" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            {t("tabs.rents")}
          </TabsTrigger>
          <TabsTrigger value="installments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {t("tabs.installments")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rents" className="mt-6">
          {isLoadingRents ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-12 w-12 text-main-400" />
            </div>
          ) : rents.length === 0 ? (
            <div className="py-12 text-center">
              <KeyRound className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
              <Typography variant="body-lg-medium" as="p" className="text-gray-500 dark:text-gray-400 mb-2">
                {t("no-rents")}
              </Typography>
              <Typography variant="body-sm" as="p" className="text-gray-400 dark:text-gray-500">
                {t("no-rents-description")}
              </Typography>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rents.map((rent) => (
                  <RentCard
                    key={rent._id}
                    rent={rent}
                    onClick={() => handleRentClick(rent._id)}
                  />
                ))}
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                disabled={isLoadingRents}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="installments" className="mt-6">
          {isLoadingInstallments ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-12 w-12 text-main-400" />
            </div>
          ) : installments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
              <Typography variant="body-lg-medium" as="p" className="text-gray-500 dark:text-gray-400 mb-2">
                {t("no-installments")}
              </Typography>
              <Typography variant="body-sm" as="p" className="text-gray-400 dark:text-gray-500">
                {t("no-installments-description")}
              </Typography>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {installments.map((installment) => (
                  <InstallmentCard
                    key={installment._id}
                    installment={installment}
                    onClick={() => handleInstallmentClick(installment._id)}
                  />
                ))}
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                disabled={isLoadingInstallments}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <RentDetailsModal
        rentId={selectedRentId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <InstallmentDetailsModal
        installmentId={selectedInstallmentId}
        isOpen={isInstallmentModalOpen}
        onClose={handleCloseInstallmentModal}
      />
    </div>
  );
}
