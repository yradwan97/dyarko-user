"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useProperty } from "@/hooks/use-properties";
import { ChevronLeft } from "lucide-react";
import { getLocalizedPath } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import Step1RentType from "./components/step1-rent-type";
import Step2ChooseDate from "./components/step2-choose-date";
import Step3Agreements from "./components/step3-agreements";
import Step4Checkout from "./components/step4-checkout";
import { type PropertyService } from "@/lib/services/api/properties";

interface RentApplicationProps {
  propertyId: string;
}

export default function RentApplication({ propertyId }: RentApplicationProps) {
  const locale = useLocale();
  const t = useTranslations("Rent");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const { data: property, isLoading, error } = useProperty(propertyId);

  // Rent application state
  const [selectedRentType, setSelectedRentType] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<PropertyService[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState({
    termsAndConditions: false,
    refundPolicy: false,
    contract: false,
    ownerRoles: !!property?.rules ? false : true,
  });

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push(getLocalizedPath(`/properties/${propertyId}`, locale));
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            {t("error.title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("error.message")}
          </p>
        </div>
      </div>
    );
  }

  const stepTitles = [
    t("steps.rentDetails"),
    t("steps.chooseDate"),
    t("steps.agreements"),
    t("steps.checkout"),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {stepTitles[currentStep - 1]}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {currentStep === 1 && (
          <Step1RentType
            property={property}
            selectedRentType={selectedRentType}
            setSelectedRentType={setSelectedRentType}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <Step2ChooseDate
            property={property}
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            onNext={handleNext}
          />
        )}

        {currentStep === 3 && (
          <Step3Agreements
            property={property}
            agreedToTerms={agreedToTerms}
            setAgreedToTerms={setAgreedToTerms}
            onNext={handleNext}
          />
        )}

        {currentStep === 4 && (
          <Step4Checkout
            property={property}
            selectedRentType={selectedRentType}
            selectedServices={selectedServices}
            selectedDates={selectedDates}
            agreedToTerms={agreedToTerms}
          />
        )}
      </div>
    </div>
  );
}
