"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { type Property } from "@/lib/services/api/properties";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { axiosClient } from "@/lib/services/axios-client";

interface Step2ChooseDateProps {
  property: Property;
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
  onNext: () => void;
}

interface BookedDateRange {
  _id: string;
  startDate: string;
  endDate: string;
}

export default function Step2ChooseDate({
  property,
  selectedDates,
  setSelectedDates,
  onNext,
}: Step2ChooseDateProps) {
  const t = useTranslations("Rent.Step2");
  const [bookedDates, setBookedDates] = useState<BookedDateRange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.post("/rents/dates", {
          property: property._id,
        });
        setBookedDates(response.data.data || []);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
        setBookedDates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedDates();
  }, [property._id]);

  const isDateBooked = (date: Date) => {
    const checkDate = new Date(date.setHours(0, 0, 0, 0));

    return bookedDates.some((range) => {
      const start = new Date(new Date(range.startDate).setHours(0, 0, 0, 0));
      const end = new Date(new Date(range.endDate).setHours(0, 0, 0, 0));
      return checkDate >= start && checkDate <= end;
    });
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    return date < today || isDateBooked(date);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("chooseYourDates")}
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t("selectDates")}
        </p>

        <div className="flex justify-center">
          <Calendar
            mode="range"
            selected={{
              from: selectedDates[0],
              to: selectedDates[selectedDates.length - 1],
            }}
            onSelect={(range) => {
              if (!range?.from) {
                setSelectedDates([]);
                return;
              }

              // Generate all dates between from and to
              const dates: Date[] = [];
              const current = new Date(range.from);
              const end = range.to || range.from;

              while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
              }

              setSelectedDates(dates);
            }}
            disabled={isDateDisabled}
            className="rounded-lg border border-gray-200 dark:border-gray-700 w-fit p-3"
          />
        </div>

        {/* Notes */}
        <div className="mt-6 space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{t("note")}:</span>
            <span>{t("noteAvailableDate", {date: new Date(property?.availableDate as string).toLocaleDateString("en-GB")})}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{t("note")}:</span>
            <span>{t("noteUnavailableDate")}</span>
          </div>
        </div>
      </div>

      {/* Selected Dates Count */}
      {selectedDates.length > 0 && (
        <div className="bg-main-50 dark:bg-main-900/20 rounded-xl p-4 border border-main-200 dark:border-main-800">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {t("selectedDates")}: {selectedDates.length}
          </p>
        </div>
      )}

      {/* Next Button */}
      <Button
        onClick={onNext}
        disabled={selectedDates.length === 0}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl"
      >
        {t("next")}
      </Button>
    </div>
  );
}
