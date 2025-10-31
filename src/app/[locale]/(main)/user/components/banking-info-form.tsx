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
      <Typography variant="body-md" as="p" className="text-gray-600">
        {t("description")}
      </Typography>

      {/* Account Holder Name */}
      <div className="space-y-2">
        <Label htmlFor="ACCName">{t("account-name")}</Label>
        <Input
          id="ACCName"
          type="text"
          placeholder={t("account-name-placeholder")}
          {...register("ACCName", {
            required: t("account-name-required"),
          })}
          className="h-12"
        />
        {errors.ACCName?.message && (
          <p className="text-sm text-red-600">{errors.ACCName.message as string}</p>
        )}
        <p className="text-xs text-gray-500">{t("account-name-hint")}</p>
      </div>

      {/* Bank Name */}
      <div className="space-y-2">
        <Label htmlFor="bankName">{t("bank-name")}</Label>
        <Input
          id="bankName"
          type="text"
          placeholder={t("bank-name-placeholder")}
          {...register("bankName", {
            required: t("bank-name-required"),
          })}
          className="h-12"
        />
        {errors.bankName?.message && (
          <p className="text-sm text-red-600">{errors.bankName.message as string}</p>
        )}
        <p className="text-xs text-gray-500">{t("bank-name-hint")}</p>
      </div>

      {/* IBAN */}
      <div className="space-y-2">
        <Label htmlFor="IBAN">{t("iban")}</Label>
        <Input
          id="IBAN"
          type="text"
          placeholder={t("iban-placeholder")}
          {...register("IBAN", {
            required: t("iban-required"),
          })}
          className="h-12 uppercase"
        />
        {errors.IBAN?.message && (
          <p className="text-sm text-red-600">{errors.IBAN.message as string}</p>
        )}
        <p className="text-xs text-gray-500">{t("iban-hint")}</p>
      </div>

      {/* Swift Code */}
      <div className="space-y-2">
        <Label htmlFor="swiftCode">{t("swift")}</Label>
        <Input
          id="swiftCode"
          type="text"
          placeholder={t("swift-placeholder")}
          {...register("swiftCode", {
            required: t("swift-required"),
          })}
          className="h-12 uppercase"
        />
        {errors.swiftCode?.message && (
          <p className="text-sm text-red-600">{errors.swiftCode.message as string}</p>
        )}
        <p className="text-xs text-gray-500">{t("swift-hint")}</p>
      </div>
    </div>
  );
}
