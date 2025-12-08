"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Property } from "@/lib/services/api/properties";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getLocalizedPath } from "@/lib/utils";

interface Step3AgreementsProps {
  property: Property;
  agreedToTerms: {
    termsAndConditions: boolean;
    refundPolicy: boolean;
    contract: boolean;
    ownerRoles: boolean;
  };
  setAgreedToTerms: (terms: any) => void;
  onNext: () => void;
}

export default function Step3Agreements({
  property,
  agreedToTerms,
  setAgreedToTerms,
  onNext,
}: Step3AgreementsProps) {
  const locale = useLocale();
  const t = useTranslations("Rent.Step3");

  const hasContract = !!property?.contract;
  const hasRules = !!property?.rules;

  const handleCheckboxChange = (key: string, checked: boolean) => {
    setAgreedToTerms({
      ...agreedToTerms,
      [key]: checked,
    });
  };

  const handleCheckAll = (checked: boolean) => {
    setAgreedToTerms({
      termsAndConditions: checked,
      refundPolicy: checked,
      contract: hasContract ? checked : true,
      ownerRoles: hasRules ? checked : true,
    });
  };

  // Only check visible items for allChecked/someChecked
  const visibleTerms = {
    termsAndConditions: agreedToTerms.termsAndConditions,
    refundPolicy: agreedToTerms.refundPolicy,
    ...(hasContract && { contract: agreedToTerms.contract }),
    ...(hasRules && { ownerRoles: agreedToTerms.ownerRoles }),
  };

  const allChecked = Object.values(visibleTerms).every((v) => v === true);
  const someChecked = Object.values(visibleTerms).some((v) => v === true) && !allChecked;

  return (
    <div className="space-y-6">
      {/* Agreements Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t("title")}
        </h2>

        <div className="space-y-4">
          {/* Terms & Conditions */}
          <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Checkbox
              id="termsAndConditions"
              checked={agreedToTerms.termsAndConditions}
              onCheckedChange={(checked) =>
                handleCheckboxChange("termsAndConditions", checked as boolean)
              }
              className="mt-0.5"
            />
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
              <Link
                href={getLocalizedPath("/terms-conditions", locale)}
                target="_blank"
                className="text-main-500 hover:underline"
              >
                {t("termsAndConditions")}
              </Link>
            </div>
          </div>

          {/* Refund Policy */}
          <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <Checkbox
              id="refundPolicy"
              checked={agreedToTerms.refundPolicy}
              onCheckedChange={(checked) =>
                handleCheckboxChange("refundPolicy", checked as boolean)
              }
              className="mt-0.5"
            />
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
              <Link
                href={getLocalizedPath("/refund-policy", locale)}
                target="_blank"
                className="text-main-500 hover:underline"
              >
                {t("refundPolicy")}
              </Link>
            </div>
          </div>

          {/* Contract */}
          {hasContract && (
            <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <Checkbox
                id="contract"
                checked={agreedToTerms.contract}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("contract", checked as boolean)
                }
                className="mt-0.5"
              />
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                <Link
                  href={property.contract!}
                  target="_blank"
                  className="text-main-500 hover:underline"
                >
                  {t("contract")}
                </Link>
              </div>
            </div>
          )}

          {/* Owner Rules */}
          {hasRules && (
            <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <Checkbox
                id="ownerRules"
                checked={agreedToTerms.ownerRoles}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("ownerRoles", checked as boolean)
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="ownerRules"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
              >
                {t("ownerRoles")}
                <Input defaultValue={property.rules} disabled className="block cursor-not-allowed text-2xl text-black dark:text-gray-400 mt-1 py-2"/>
              </Label>
            </div>
          )}
        </div>
      </div>

      {/* Check All */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Checkbox
            id="checkAll"
            checked={allChecked}
            onCheckedChange={(checked) => handleCheckAll(checked as boolean)}
            className="data-[state=indeterminate]:bg-main-500"
            {...(someChecked && { "data-state": "indeterminate" })}
          />
          <Label
            htmlFor="checkAll"
            className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer flex-1"
          >
            {t("checkAll")}
          </Label>
        </div>
      </div>

      {/* Next Button */}
      <Button
        onClick={onNext}
        disabled={!allChecked}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl"
      >
        {t("next")}
      </Button>
    </div>
  );
}
