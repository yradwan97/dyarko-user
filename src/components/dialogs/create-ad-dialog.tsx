"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useGetPaymentMethods } from "@/hooks/use-payment-methods";
import { useCreateAd } from "@/hooks/use-ads";

interface CreateAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAdDialog({ open, onOpenChange }: CreateAdDialogProps) {
  const t = useTranslations("CreateAd");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [adData, setAdData] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("");

  // Only fetch payment methods when we reach step 2
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useGetPaymentMethods(step === 2);
  const createAdMutation = useCreateAd();

  const createAdSchema = z.object({
    title: z.string().min(1, t("title-required")),
    description: z.string().min(1, t("description-required")).max(500, t("description-max")),
    price: z.string().min(1, t("price-required")),
    priceType: z.enum(["daily", "weekly", "monthly"], {
      required_error: t("price-type-required"),
    }),
  });

  type CreateAdFormData = z.infer<typeof createAdSchema>;

  const form = useForm<CreateAdFormData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      priceType: "weekly",
    },
  });

  const onSubmit = (data: CreateAdFormData) => {
    // Store form data and move to payment step
    setAdData({
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      priceType: data.priceType,
    });
    setStep(2);
  };

  const handlePaymentSubmit = () => {
    if (!selectedPayment) return;

    const submitData = {
      ...adData,
      paymentMethod: selectedPayment,
    };

    createAdMutation.mutate(submitData, {
      onSuccess: (response: any) => {
        if (response.status === "success" && response.data?.PayUrl) {
          toast.success(response.message || "Payment session initiated successfully!");

          // Close the dialog first
          handleClose();

          // Open payment URL in a new window
          const paymentWindow = window.open(
            response.data.PayUrl,
            "_blank",
            "width=800,height=600,scrollbars=yes,resizable=yes"
          );

          if (!paymentWindow) {
            // If popup was blocked, show a message
            toast.error("Please allow popups to proceed with payment");
            // Fallback: navigate to the payment URL in the same tab
            window.location.href = response.data.PayUrl;
          } else {
            // Monitor the payment window
            const checkWindowClosed = setInterval(() => {
              if (paymentWindow.closed) {
                clearInterval(checkWindowClosed);
                // Optionally redirect or refresh after payment window is closed
                router.refresh();
              }
            }, 1000);
          }
        } else {
          toast.success(t("success-message") || "Ad created successfully!");
          handleClose();
        }
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || t("error-message") || "Failed to create ad. Please try again.";
        toast.error(errorMessage);
      },
    });
  };

  const handleClose = () => {
    setStep(1);
    setAdData(null);
    setSelectedPayment("");
    form.reset();
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedPayment("");
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <DialogTitle className="flex-1 text-center text-xl font-bold">
              {step === 1 ? t("title") : t("payment-title")}
            </DialogTitle>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
          {step === 1 && (
            <p className="text-center text-sm text-gray-600">
              {t("subtitle")}
            </p>
          )}
        </DialogHeader>

        {step === 1 ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="rtl:text-right block">{t("title-label")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("title-placeholder")}
                        className="rtl:text-right rtl:placeholder:text-right"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="rtl:text-right" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t("description-placeholder")}
                        className="min-h-[120px] resize-none rtl:text-right rtl:placeholder:text-right"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-gray-500">
                      <FormMessage className="rtl:text-right" />
                      <span className="rtl:text-left">
                        {field.value.length}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="rtl:text-right block">{t("price-label")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("price-placeholder")}
                          className="rtl:text-right rtl:placeholder:text-right"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="rtl:text-right" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="rtl:text-right block">{t("price-type-label")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rtl:text-right">
                            <SelectValue placeholder={t("price-type-placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily" className="rtl:text-right">
                            {t("daily")}
                          </SelectItem>
                          <SelectItem value="weekly" className="rtl:text-right">
                            {t("weekly")}
                          </SelectItem>
                          <SelectItem value="monthly" className="rtl:text-right">
                            {t("monthly")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="rtl:text-right" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-main-500 text-white hover:bg-main-600"
              >
                {t("submit")}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">{t("pay-with")}</h3>

            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              {paymentMethodsLoading ? (
                <div className="py-8 text-center text-gray-500">
                  {t("loading-payments")}
                </div>
              ) : (
                paymentMethods?.map((method) => (
                  <div
                    key={method.key}
                    className="flex items-center space-x-2 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 rtl:space-x-reverse"
                  >
                    <RadioGroupItem value={method.key} id={method.key} />
                    <Label
                      htmlFor={method.key}
                      className="flex flex-1 cursor-pointer items-center gap-3"
                    >
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                          src={method.logo}
                          alt={method.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <span className="font-medium">{method.name}</span>
                    </Label>
                  </div>
                ))
              )}
            </RadioGroup>

            <Button
              onClick={handlePaymentSubmit}
              disabled={!selectedPayment || createAdMutation.isPending}
              className="w-full bg-main-500 text-white hover:bg-main-600 disabled:opacity-50"
            >
              {createAdMutation.isPending ? t("submitting") : t("continue")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
