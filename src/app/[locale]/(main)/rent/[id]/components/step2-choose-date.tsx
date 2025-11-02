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
  timeRange?: { from: string; to: string };
  setTimeRange?: (timeRange: { from: string; to: string }) => void;
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
  timeRange,
  setTimeRange,
  onNext,
}: Step2ChooseDateProps) {
  const t = useTranslations("Rent.Step2");
  const [bookedDates, setBookedDates] = useState<BookedDateRange[]>([]);
  const [loading, setLoading] = useState(true);

  const isCourt = property.category === "court";

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

      {/* Time Range Picker - Court Only */}
      {isCourt && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("selectTimeRange")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* From Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("fromTime")}
              </label>
              <input
                type="time"
                value={timeRange?.from || ""}
                onChange={(e) => setTimeRange?.({ ...timeRange, from: e.target.value } as { from: string; to: string })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-main-500 focus:border-transparent"
              />
            </div>

            {/* To Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("toTime")}
              </label>
              <input
                type="time"
                value={timeRange?.to || ""}
                onChange={(e) => setTimeRange?.({ ...timeRange, to: e.target.value } as { from: string; to: string })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-main-500 focus:border-transparent"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            {t("timeRangeNote")}
          </p>
        </div>
      )}

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
        disabled={
          selectedDates.length === 0 ||
          (isCourt && (!timeRange?.from || !timeRange?.to))
        }
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("next")}
      </Button>
    </div>
  );
}
