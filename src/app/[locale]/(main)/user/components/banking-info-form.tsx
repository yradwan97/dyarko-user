"use client";

import { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Typography from "@/components/shared/typography";

interface BankingInfoFormProps {
  formMethods: UseFormReturn<any>;
}

export default function BankingInfoForm({ formMethods }: BankingInfoFormProps) {
  const t = useTranslations("User.Profile.Banking");

  const {
    register,
    formState: { errors },
  } = formMethods;

  return (
    <div className="space-y-6">
      <Typography variant="body-md" as="p" className="text-gray-600 rtl:text-right">
        {t("description")}
      </Typography>

      {/* Account Holder Name */}
      <div className="space-y-2">
        <Label htmlFor="ACCName" className="rtl:text-right block">{t("account-name")}</Label>
        <Input
          id="ACCName"
          type="text"
          placeholder={t("account-name-placeholder")}
          {...register("ACCName", {
            required: t("account-name-required"),
          })}
          className="h-12 rtl:text-right rtl:placeholder:text-right"
        />
        {errors.ACCName?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.ACCName.message as string}</p>
        )}
        <p className="text-xs text-gray-500 rtl:text-right">{t("account-name-hint")}</p>
      </div>

      {/* Bank Name */}
      <div className="space-y-2">
        <Label htmlFor="bankName" className="rtl:text-right block">{t("bank-name")}</Label>
        <Input
          id="bankName"
          type="text"
          placeholder={t("bank-name-placeholder")}
          {...register("bankName", {
            required: t("bank-name-required"),
          })}
          className="h-12 rtl:text-right rtl:placeholder:text-right"
        />
        {errors.bankName?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.bankName.message as string}</p>
        )}
        <p className="text-xs text-gray-500 rtl:text-right">{t("bank-name-hint")}</p>
      </div>

      {/* IBAN */}
      <div className="space-y-2">
        <Label htmlFor="IBAN" className="rtl:text-right block">{t("iban")}</Label>
        <Input
          id="IBAN"
          type="text"
          placeholder={t("iban-placeholder")}
          {...register("IBAN", {
            required: t("iban-required"),
          })}
          className="h-12 uppercase rtl:text-right rtl:placeholder:text-right"
        />
        {errors.IBAN?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.IBAN.message as string}</p>
        )}
        <p className="text-xs text-gray-500 rtl:text-right">{t("iban-hint")}</p>
      </div>

      {/* Swift Code */}
      <div className="space-y-2">
        <Label htmlFor="swiftCode" className="rtl:text-right block">{t("swift")}</Label>
        <Input
          id="swiftCode"
          type="text"
          placeholder={t("swift-placeholder")}
          {...register("swiftCode", {
            required: t("swift-required"),
          })}
          className="h-12 uppercase rtl:text-right rtl:placeholder:text-right"
        />
        {errors.swiftCode?.message && (
          <p className="text-sm text-red-600 rtl:text-right">{errors.swiftCode.message as string}</p>
        )}
        <p className="text-xs text-gray-500 rtl:text-right">{t("swift-hint")}</p>
      </div>
    </div>
  );
}
