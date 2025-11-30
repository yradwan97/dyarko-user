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
import { useManagementConfigContext } from "@/components/providers/management-config-provider";
import { useCountries } from "@/hooks/use-countries";
import { useCities } from "@/hooks/use-cities";

interface CreateAdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAdDialog({ open, onOpenChange }: CreateAdDialogProps) {
  const t = useTranslations("CreateAd");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [adData, setAdData] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  // Get management config from provider
  const { config, currency } = useManagementConfigContext();
  const adPrice = config?.userAd?.amount;
  const adDuration = config?.userAd?.duration;

  // Fetch countries and cities
  const { data: countries, isLoading: countriesLoading } = useCountries();
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);

  // Only fetch payment methods when we reach step 2
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useGetPaymentMethods(step === 2);
  const createAdMutation = useCreateAd();

  const createAdSchema = z.object({
    title: z.string().min(1, t("title-required")),
    description: z.string().min(1, t("description-required")).max(500, t("description-max")),
    country: z.string().min(1, t("country-required")),
    city: z.string().min(1, t("city-required")),
    priceFrom: z.string().min(1, t("price-from-required")),
    priceTo: z.string().min(1, t("price-to-required")),
    priceType: z.enum(["daily", "weekly", "monthly"], {
      error: t("price-type-required"),
    }),
  });

  type CreateAdFormData = z.infer<typeof createAdSchema>;

  const form = useForm<CreateAdFormData>({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      title: "",
      description: "",
      country: "",
      city: "",
      priceFrom: "",
      priceTo: "",
      priceType: "weekly",
    },
  });

  const onSubmit = (data: CreateAdFormData) => {
    // Store form data and move to payment step
    setAdData({
      title: data.title,
      description: data.description,
      country: data.country,
      city: data.city,
      price: {
        from: parseFloat(data.priceFrom),
        to: parseFloat(data.priceTo),
      },
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
    setStep(0);
    setAdData(null);
    setSelectedPayment("");
    setSelectedCountry("");
    form.reset();
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedPayment("");
    } else if (step === 1) {
      setStep(0);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          {step === 0 ? (
            <DialogTitle className="sr-only">{t("intro-title")}</DialogTitle>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleBack}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <ChevronLeft className={`h-5 w-5 ${locale === "ar" ? "rotate-180" : ""}`} />
              </button>
              <DialogTitle className="flex-1 text-center text-xl font-bold">
                {step === 1 ? t("title") : t("payment-title")}
              </DialogTitle>
              <div className="w-6" /> {/* Spacer for centering */}
            </div>
          )}
          {step === 1 && (
            <p className="text-center text-sm text-gray-600">
              {t("subtitle")}
            </p>
          )}
        </DialogHeader>

        {step === 0 ? (
          <div className="space-y-6 py-4 ">
            <button
              onClick={handleBack}
              className={`absolute top-9 rounded-full p-1 hover:bg-gray-100 ${
                locale === "ar" ? "right-4" : "left-4"
              }`}
            >
              <ChevronLeft className={`h-5 w-5 ${locale === "ar" ? "rotate-180" : ""}`} />
            </button>

            <h2 className={`text-2xl font-bold text-gray-900 dark:text-white px-8 ${
              locale === "ar" ? "text-right" : "text-left"
            }`}>
              {t("intro-title")}
            </h2>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className={`flex gap-4`}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-main-600 text-white font-bold">
                  {locale === "ar" ? "١" : "1"}
                </div>
                <div className={locale === "ar" ? "text-right" : "text-left"}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t("intro-step1-title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("intro-step1-description")}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex gap-4`}>
                <div className="shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-main-600 text-white font-bold">
                    {locale === "ar" ? "٢" : "2"}
                  </div>
                </div>
                <div className={locale === "ar" ? "text-right" : "text-left"}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t("intro-step2-title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("intro-step2-description")}
                  </p>
                    {adPrice && currency && (
                      <span className="font-semibold text-main-600">
                        {" "}({adPrice} {currency} / {adDuration} {t("days")})
                      </span>
                    )}
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex gap-4 `}>
                <div className="shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-main-600 text-white font-bold">
                    {locale === "ar" ? "٣" : "3"}
                  </div>
                </div>
                <div className={locale === "ar" ? "text-right" : "text-left"}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t("intro-step3-title")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("intro-step3-description")}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep(1)}
              className="w-full bg-main-600 text-white hover:bg-main-700 h-12 text-base font-semibold"
            >
              {t("intro-start-button")}
            </Button>
          </div>
        ) : step === 1 ? (
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
                        {(field.value || "").length}/500
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="rtl:text-right block">{t("country-label")}</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedCountry(value);
                          form.setValue("city", ""); // Reset city when country changes
                        }}
                        value={field.value}
                        disabled={countriesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="rtl:text-right">
                            <SelectValue placeholder={t("country-placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries?.map((country, index) => (
                            <SelectItem key={country.code || `country-${index}`} value={country.code} className="rtl:text-right">
                              {locale === "ar" ? country.countryAr : country.countryEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="rtl:text-right" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="rtl:text-right block">{t("city-label")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedCountry || citiesLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="rtl:text-right">
                            <SelectValue placeholder={t("city-placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities?.map((city, index) => (
                            <SelectItem key={city.key || `city-${index}`} value={city.key} className="rtl:text-right">
                              {locale === "ar" ? city.cityAr : city.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="rtl:text-right" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="priceFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="rtl:text-right block">{t("price-from-label")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("price-from-placeholder")}
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
                  name="priceTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="rtl:text-right block">{t("price-to-label")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("price-to-placeholder")}
                          className="rtl:text-right rtl:placeholder:text-right"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="rtl:text-right" />
                    </FormItem>
                  )}
                />
              </div>

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
                    className="flex flex-row rtl:flex-row-reverse items-center gap-2 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <RadioGroupItem value={method.key} id={method.key} />
                    <Label
                      htmlFor={method.key}
                      className="flex flex-1 cursor-pointer items-center gap-3"
                    >
                      <div className="relative h-10 w-10 shrink-0">
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
