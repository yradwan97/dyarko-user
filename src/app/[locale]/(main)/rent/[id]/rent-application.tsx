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
import Step25SelectTents from "./components/step2.5-select-tents";
import Step25SelectApartments from "./components/step2.5-select-apartments";
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
  const [selectedTents, setSelectedTents] = useState<any[]>([]);
  const [selectedApartments, setSelectedApartments] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [selectedTimeSlotIndices, setSelectedTimeSlotIndices] = useState<number[]>([]);
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState({
    termsAndConditions: false,
    refundPolicy: false,
    contract: false,
    ownerRoles: !!property?.rules ? false : true,
  });

  // Check if property is camp or booth
  const isCampOrBooth = property?.category === "camp" || property?.category === "booth";
  // Check if property is hotel apartment
  const isHotelApartment = property?.category === "hotelapartment";
  // Check if property is court
  const isCourt = property?.category === "court";

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push(getLocalizedPath(`/properties/${propertyId}`, locale));
    }
  };

  const handleNext = () => {
    // For camp/booth/hotelApartment: steps are 1 -> 2 -> 2.5 (tent/apartment selection) -> 3 -> 4
    // For court and others: steps are 1 -> 2 -> 3 -> 4 (no step 2.5)
    const maxSteps = isCampOrBooth || isHotelApartment ? 5 : 4;

    if (currentStep < maxSteps) {
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

  const stepTitles = isCampOrBooth
    ? [
        t("steps.rentDetails"),
        t("steps.chooseDate"),
        t("steps.selectTents"),
        t("steps.agreements"),
        t("steps.checkout"),
      ]
    : isHotelApartment
    ? [
        t("steps.rentDetails"),
        t("steps.chooseDate"),
        t("steps.selectApartments"),
        t("steps.agreements"),
        t("steps.checkout"),
      ]
    : [
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
            pickupLocation={pickupLocation}
            setPickupLocation={setPickupLocation}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <Step2ChooseDate
            property={property}
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            selectedTimeSlotIndices={selectedTimeSlotIndices}
            setSelectedTimeSlotIndices={setSelectedTimeSlotIndices}
            onNext={handleNext}
          />
        )}

        {isCampOrBooth && currentStep === 3 && (
          <Step25SelectTents
            property={property}
            selectedDates={selectedDates}
            selectedTents={selectedTents}
            setSelectedTents={setSelectedTents}
            onNext={handleNext}
          />
        )}

        {isHotelApartment && currentStep === 3 && (
          <Step25SelectApartments
            property={property}
            selectedRentType={selectedRentType}
            selectedApartments={selectedApartments}
            setSelectedApartments={setSelectedApartments}
            onNext={handleNext}
          />
        )}

        {currentStep === (isCampOrBooth || isHotelApartment ? 4 : 3) && (
          <Step3Agreements
            property={property}
            agreedToTerms={agreedToTerms}
            setAgreedToTerms={setAgreedToTerms}
            onNext={handleNext}
          />
        )}

        {currentStep === (isCampOrBooth || isHotelApartment ? 5 : 4) && (
          <Step4Checkout
            property={property}
            selectedRentType={selectedRentType}
            selectedServices={selectedServices}
            selectedDates={selectedDates}
            selectedTents={selectedTents}
            selectedApartments={selectedApartments}
            timeRange={timeRange}
            agreedToTerms={agreedToTerms}
            pickupLocation={pickupLocation}
          />
        )}
      </div>
    </div>
  );
}
