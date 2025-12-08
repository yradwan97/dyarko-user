"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSignup } from "@/hooks/use-auth";
import { useCountries } from "@/hooks/use-countries";
import { useNationalities } from "@/hooks/use-nationalities";
import { TermsModal } from "./components/terms-modal";
import { PrivacyModal } from "./components/privacy-modal";
import { RefundModal } from "./components/refund-modal";
import { SignupSuccessModal } from "./components/signup-success-modal";
import { useGetTermsAndConditions } from "./hooks/use-get-terms";
import { useGetPrivacyPolicy } from "./hooks/use-get-privacy";
import { useGetRefundPolicy } from "./hooks/use-get-refund";

export default function SignUpPage() {
  const t = useTranslations("SignUp");
  const locale = useLocale();
  const signupMutation = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  // Fetch countries, nationalities, and policies
  const { data: countries, isLoading: countriesLoading } = useCountries();
  const { data: nationalities, isLoading: nationalitiesLoading } = useNationalities();
  const { terms, isSuccess: hasTerms } = useGetTermsAndConditions();
  const { policies, isSuccess: hasPolicies } = useGetPrivacyPolicy();
  const { policies: refundPolicies, isSuccess: hasRefund } = useGetRefundPolicy();

  const signupSchema = useMemo(() => {
    // Check if policies actually have items
    const hasTermsItems = hasTerms && terms && terms.length > 0;
    const hasPoliciesItems = hasPolicies && policies && policies.length > 0;
    const hasRefundItems = hasRefund && refundPolicies && refundPolicies.length > 0;

    const baseSchema = {
      name: z
        .string()
        .min(1, t("Name.required"))
        .regex(/^[a-zA-Z ]+$/, t("Name.letters-only")),
      email: z.string().min(1, t("Email.required")).email(t("Email.valid")),
      country: z.string().min(1, t("Country.required")),
      nationality: z.string().min(1, t("Nationality.required")),
      phoneNumber: z
        .string()
        .min(1, t("Phone.required"))
        .regex(/^\d+$/, t("Phone.numbers-only")),
      password: z.string().min(1, t("Password.required")).min(8, t("Password.valid")),
      confirmPassword: z.string().min(1, t("ConfirmPassword.required")),
    };

    // Add policy agreements only if they have items
    const schemaWithPolicies = {
      ...baseSchema,
      ...(hasTermsItems && { termsAgree: z.boolean().refine(val => val === true, { message: t("agree") }) }),
      ...(hasPoliciesItems && { privacyAgree: z.boolean().refine(val => val === true, { message: t("agree") }) }),
      ...(hasRefundItems && { refundAgree: z.boolean().refine(val => val === true, { message: t("agree") }) }),
    };

    return z.object(schemaWithPolicies).superRefine((data, ctx) => {
      // Validate phone number length based on selected country
      if (data.country && data.phoneNumber && countries) {
        const country = countries.find((c) => c.code === data.country);
        if (country && country.mobileLength) {
          const phoneNumberLength = data.phoneNumber.length;
          if (phoneNumberLength !== country.mobileLength) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t("Phone.length", { length: country.mobileLength }),
              path: ["phoneNumber"],
            });
          }
        }
      }

      // Validate confirm password matches password
      if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("ConfirmPassword.mismatch"),
          path: ["confirmPassword"],
        });
      }
    });
  }, [t, hasTerms, hasPolicies, hasRefund, terms, policies, refundPolicies, countries]);

  type SignupFormData = z.infer<typeof signupSchema>;

  // Check if policies actually have items
  const hasTermsItems = hasTerms && terms && terms.length > 0;
  const hasPoliciesItems = hasPolicies && policies && policies.length > 0;
  const hasRefundItems = hasRefund && refundPolicies && refundPolicies.length > 0;

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      nationality: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      // If policies exist with items, set to false (user must check), otherwise set to true (auto-checked)
      ...(hasTermsItems ? { termsAgree: false } : { termsAgree: true }),
      ...(hasPoliciesItems ? { privacyAgree: false } : { privacyAgree: true }),
      ...(hasRefundItems ? { refundAgree: false } : { refundAgree: true }),
    },
  });

  // Get selected country for dynamic phone placeholder
  const selectedCountryCode = form.watch("country");
  const selectedCountry = countries?.find((c) => c.code === selectedCountryCode);
  const phoneNumberPlaceholder = useMemo(() => {
    if (!selectedCountry) return t("Phone.placeholder");
    return "X".repeat(selectedCountry.mobileLength);
  }, [selectedCountry, t]);

  // Re-validate phone number when country changes
  useEffect(() => {
    const phoneValue = form.getValues("phoneNumber");
    if (selectedCountryCode && phoneValue) {
      form.trigger("phoneNumber");
    }
  }, [selectedCountryCode, form]);

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(
      {
        name: data.name,
        email: data.email,
        country: data.country,
        nationality: data.nationality,
        phoneNumber: data.phoneNumber,
        password: data.password,
      },
      {
        onSuccess: () => {
          setSignupEmail(data.email);
          setSuccessModalOpen(true);
        },
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t("create-account")}</h1>
        <p className="mt-2 text-gray-600">{t("sub")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("Name.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Name.placeholder")}
                    className="h-12"
                    disabled={signupMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("Email.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("Email.placeholder")}
                    className="h-12"
                    disabled={signupMutation.isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("Nationality.label")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={signupMutation.isPending || nationalitiesLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder={t("Nationality.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {nationalities?.map((nationality) => (
                      <SelectItem key={nationality.code} value={nationality.code}>
                        {locale === "ar" ? nationality.nameAr : nationality.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("Country.label")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={signupMutation.isPending || countriesLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue placeholder={t("Country.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries?.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {locale === "ar" ? country.countryAr : country.countryEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("Phone.label")}</FormLabel>
                <FormControl>
                  <div className="flex gap-2" dir="ltr">
                    {selectedCountry && (
                      <div className="flex h-12 min-w-20 items-center justify-center rounded-md border border-input bg-gray-50 px-3 text-sm font-medium text-gray-700">
                        {selectedCountry.countryCode}
                      </div>
                    )}
                    <Input
                      type="tel"
                      placeholder={phoneNumberPlaceholder}
                      className="h-12 flex-1"
                      maxLength={selectedCountry?.mobileLength || 15}
                      disabled={signupMutation.isPending}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("Password.label")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("Password.placeholder")}
                      className="h-12 pe-12"
                      disabled={signupMutation.isPending}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute ltr:right-0 rtl:left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={signupMutation.isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">{t("ConfirmPassword.label")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("ConfirmPassword.placeholder")}
                      className="h-12 pe-12"
                      disabled={signupMutation.isPending}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute ltr:right-0 rtl:left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={signupMutation.isPending}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms and Conditions */}
          {hasTermsItems && (
            <FormField
              control={form.control}
              name="termsAgree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                      disabled={signupMutation.isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-normal">
                      <button
                        type="button"
                        onClick={() => setTermsOpen(true)}
                        className="text-main-500 hover:text-main-600 hover:underline"
                      >
                        {t("agree-terms")}
                      </button>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          )}

          {/* Privacy Policy */}
          {hasPoliciesItems && (
            <FormField
              control={form.control}
              name="privacyAgree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                      disabled={signupMutation.isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-normal">
                      <button
                        type="button"
                        onClick={() => setPrivacyOpen(true)}
                        className="text-main-500 hover:text-main-600 hover:underline"
                      >
                        {t("agree-privacy")}
                      </button>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          )}

          {/* Refund Policy */}
          {hasRefundItems && (
            <FormField
              control={form.control}
              name="refundAgree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                      disabled={signupMutation.isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-normal">
                      <button
                        type="button"
                        onClick={() => setRefundOpen(true)}
                        className="text-main-500 hover:text-main-600 hover:underline"
                      >
                        {t("agree-refund")}
                      </button>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          )}

          <Button
            type="submit"
            className="h-12 w-full bg-main-500 text-white transition-colors hover:bg-main-600"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("loading")}
              </>
            ) : (
              t("sign-up")
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-8 space-y-3 text-center text-sm">
        <p className="text-gray-600">
          {t("got-account")}{" "}
          <Link
            href="/login"
            className="font-semibold text-main-500 transition-colors hover:text-main-600 hover:underline"
          >
            {t("login")}
          </Link>
        </p>
        <p className="text-gray-600">
          {t("is-owner")}{" "}
          <Link
            href={process.env.NEXT_PUBLIC_OWNER_DASHBOARD_URL || "#"}
            className="font-semibold text-main-500 transition-colors hover:text-main-600 hover:underline"
          >
            {t("owner-login")}
          </Link>
        </p>
      </div>

      {/* Modals */}
      {hasTermsItems && <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} terms={terms} />}
      {hasPoliciesItems && <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} policies={policies} />}
      {hasRefundItems && <RefundModal isOpen={refundOpen} onClose={() => setRefundOpen(false)} policies={refundPolicies} />}
      <SignupSuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        email={signupEmail}
      />
    </div>
  );
}
