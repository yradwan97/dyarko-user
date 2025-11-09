"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { getPublicServices, requestServices } from "@/lib/services/api/services";
// import { useCountryCurrency } from "@/hooks/use-country-currency";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface RequestServicesDialogProps {
  rentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RequestServicesDialog({
  rentId,
  open,
  onOpenChange,
}: RequestServicesDialogProps) {
  const t = useTranslations("User.MyRealEstates.RequestServicesDialog");
  const locale = useLocale();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: services, isLoading } = useQuery({
    queryKey: ["public-services"],
    queryFn: getPublicServices,
    enabled: open,
  });

  const requestServicesMutation = useMutation({
    mutationFn: requestServices,
    onSuccess: () => {
      toast.success(t("success"));
      setSelectedServices([]);
      setShowConfirmation(false);
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t("error"));
    },
  });

  const handleToggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = () => {
    if (selectedServices.length === 0) {
      toast.error(t("no-services-selected"));
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (!rentId) return;

    requestServicesMutation.mutate({
      rent: rentId,
      services: selectedServices,
    });
  };

  const selectedServicesData = services?.filter((service) =>
    selectedServices.includes(service._id)
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {t("title")}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-12 w-12 text-main-400" />
            </div>
          ) : services && services.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("description")}
              </div>

              {/* Services List */}
              <div className="space-y-3">
                {services.map((service) => {
                  const isSelected = selectedServices.includes(service._id);
                  const serviceName = locale === "ar" ? service.nameAr : service.nameEn;

                  return (
                    <div
                      key={service._id}
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "border-main-500 bg-main-50 dark:bg-main-950/20"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                      onClick={() => handleToggleService(service._id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleService(service._id)}
                        className="mt-1"
                      />

                      {service.image && (
                        <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-800">
                          <Image
                            src={service.image}
                            alt={serviceName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {serviceName}
                        </h4>
                        {/* <p className="text-sm font-medium text-main-600 dark:text-main-400">
                          {service.price} {currency}
                        </p> */}
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-main-500 shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              {selectedServices.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("selected-count", { count: selectedServices.length })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t("no-services")}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={requestServicesMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedServices.length === 0 || requestServicesMutation.isPending}
            >
              {t("submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="bg-white dark:bg-gray-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              {t("confirmation.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {t("confirmation.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Selected Services Summary */}
          <div className="space-y-2 my-4">
            {selectedServicesData?.map((service) => {
              const serviceName = locale === "ar" ? service.nameAr : service.nameEn;
              return (
                <div
                  key={service._id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded"
                >
                  <span className="text-gray-900 dark:text-white">{serviceName}</span>
                  {/* <span className="font-medium text-gray-900 dark:text-white">
                    {service.price} {currency}
                  </span> */}
                </div>
              );
            })}
            {/* <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-gray-200 dark:border-gray-800">
              <span className="text-gray-900 dark:text-white">{t("confirmation.total")}</span>
              <span className="text-gray-900 dark:text-white">
                {totalPrice} {currency}
              </span>
            </div> */}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-gray-900 dark:text-white"
              disabled={requestServicesMutation.isPending}
            >
              {t("confirmation.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={requestServicesMutation.isPending}
            >
              {requestServicesMutation.isPending ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  {t("confirmation.submitting")}
                </>
              ) : (
                t("confirmation.confirm")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
