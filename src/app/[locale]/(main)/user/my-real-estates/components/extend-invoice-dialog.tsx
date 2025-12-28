"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { axiosClient } from "@/lib/services";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ExtendInvoiceDialogProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minDate?: Date; // Current invoice's due date
  maxDate?: Date; // Next invoice's due date (optional - if no next invoice)
}

interface ExtendInvoicePayload {
  invoice: string;
  extendDate: string;
  extendReason: string;
}

export default function ExtendInvoiceDialog({
  invoiceId,
  open,
  onOpenChange,
  minDate,
  maxDate,
}: ExtendInvoiceDialogProps) {
  const t = useTranslations("User.MyRealEstates.ExtendInvoiceDialog");
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [reason, setReason] = useState<string>("");

  const extendInvoiceMutation = useMutation({
    mutationFn: async (payload: ExtendInvoicePayload) => {
      const response = await axiosClient.post("/invoices/extends", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      handleClose();
    },
    onError: () => {
      toast.error(t("error"));
    },
  });

  const handleClose = () => {
    setSelectedDate(undefined);
    setReason("");
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!invoiceId || !selectedDate || !reason.trim()) {
      toast.error(t("fill-all-fields"));
      return;
    }

    // Convert date to MM/dd/yyyy format
    const formattedDate = format(selectedDate, "MM/dd/yyyy");

    extendInvoiceMutation.mutate({
      invoice: invoiceId,
      extendDate: formattedDate,
      extendReason: reason.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              {t("extend-date")}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>{t("select-date")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    // Cannot pick a date before the invoice's due date
                    if (minDate && date < minDate) return true;
                    // Cannot pick a date after the next invoice's due date
                    if (maxDate && date > maxDate) return true;
                    // Fallback: cannot pick a date in the past
                    if (!minDate && date < new Date()) return true;
                    return false;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-2">
            <Label
              htmlFor="extend-reason"
              className="text-sm font-medium text-gray-900 dark:text-white"
            >
              {t("reason")}
            </Label>
            <Textarea
              id="extend-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reason-placeholder")}
              rows={4}
              className="w-full resize-none bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={extendInvoiceMutation.isPending}
            className="border-gray-200 dark:border-gray-800"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              extendInvoiceMutation.isPending || !selectedDate || !reason.trim()
            }
            className="bg-main-600 hover:bg-main-700 text-white"
          >
            {extendInvoiceMutation.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              t("submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
