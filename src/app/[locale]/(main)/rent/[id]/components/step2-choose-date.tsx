"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { type Property } from "@/lib/services/api/properties";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { axiosClient } from "@/lib/services/axios-client";
import { cn } from "@/lib/utils";

interface Step2ChooseDateProps {
  property: Property;
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
  timeRange?: { from: string; to: string };
  setTimeRange?: (timeRange: { from: string; to: string }) => void;
  selectedTimeSlotIndices?: number[];
  setSelectedTimeSlotIndices?: (indices: number[]) => void;
  onNext: () => void;
}

interface BookedDateRange {
  _id: string;
  startDate: string;
  endDate: string;
}

interface TimeSlot {
  start: Date;
  end: Date;
  isBooked: boolean;
}

export default function Step2ChooseDate({
  property,
  selectedDates,
  setSelectedDates,
  timeRange,
  setTimeRange,
  selectedTimeSlotIndices: parentSelectedTimeSlotIndices,
  setSelectedTimeSlotIndices: parentSetSelectedTimeSlotIndices,
  onNext,
}: Step2ChooseDateProps) {
  const t = useTranslations("Rent.Step2");
  const [bookedDates, setBookedDates] = useState<BookedDateRange[]>([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const isCourt = property.category === "court";

  // Use parent state if provided, otherwise use local state
  const selectedTimeSlotIndices = parentSelectedTimeSlotIndices || [];
  const setSelectedTimeSlotIndices = parentSetSelectedTimeSlotIndices || (() => {});

  // Helper function to parse time string and extract hour
  const parseTimeToHour = (timeStr: string | undefined, defaultHour: number): number => {
    if (!timeStr) return defaultHour;

    // Remove spaces and convert to lowercase for easier parsing
    const cleanTime = timeStr.trim().toLowerCase();

    // Try to match HH:MM format (24-hour or 12-hour)
    const timeMatch = cleanTime.match(/(\d{1,2}):?(\d{2})?/);
    if (!timeMatch) return defaultHour;

    let hour = parseInt(timeMatch[1], 10);

    // Handle 12-hour format with AM/PM
    if (cleanTime.includes('pm') && hour !== 12) {
      hour += 12;
    } else if (cleanTime.includes('am') && hour === 12) {
      hour = 0;
    }

    return hour;
  };

  // Generate time slots for the day (1-hour increments)
  const generateTimeSlots = (date: Date, bookedTimes: string[]): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    // Use property opening/closing times, fallback to 6 AM - 11 PM
    const startHour = parseTimeToHour(property.openingTime, 6);
    const endHour = parseTimeToHour(property.closingTime, 23);

    // Generate slots in 1-hour increments
    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check if this slot is booked
      const isBooked = bookedTimes.some(bookedTime => {
        const bookedDate = new Date(bookedTime);
        return bookedDate >= slotStart && bookedDate < slotEnd;
      });

      slots.push({
        start: slotStart,
        end: slotEnd,
        isBooked,
      });
    }

    return slots;
  };

  // Fetch booked dates or time slots
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        setLoading(true);

        if (isCourt && selectedDates.length > 0) {
          // For courts with a selected date, fetch booked time slots
          const date = selectedDates[0];
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

          const response = await axiosClient.post("/rents/dates", {
            property: property._id,
            date: formattedDate,
          });
          const bookedTimes = response.data.data || [];
          setBookedTimeSlots(bookedTimes);

          // Generate time slots for the selected day
          const slots = generateTimeSlots(selectedDates[0], bookedTimes);
          setTimeSlots(slots);
        } else if (!isCourt) {
          // For non-court properties, fetch booked date ranges
          const response = await axiosClient.post("/rents/dates", {
            property: property._id,
          });
          setBookedDates(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching booked dates:", error);
        setBookedDates([]);
        setBookedTimeSlots([]);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedDates();
  }, [property._id, isCourt, selectedDates.length > 0 ? selectedDates[0].toISOString() : ""]);

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

  // Handle time slot selection with sequential validation
  const handleTimeSlotClick = (index: number) => {
    if (timeSlots[index].isBooked) return;

    if (selectedTimeSlotIndices.length === 0) {
      // First selection
      setSelectedTimeSlotIndices([index]);
    } else if (selectedTimeSlotIndices.includes(index)) {
      // Deselect - remove this and all after/before depending on position
      const position = selectedTimeSlotIndices.indexOf(index);
      const minIndex = Math.min(...selectedTimeSlotIndices);
      const maxIndex = Math.max(...selectedTimeSlotIndices);

      if (index === minIndex) {
        // Remove from start
        setSelectedTimeSlotIndices(selectedTimeSlotIndices.filter(i => i > index));
      } else if (index === maxIndex) {
        // Remove from end
        setSelectedTimeSlotIndices(selectedTimeSlotIndices.filter(i => i < index));
      } else {
        // Click in middle - keep only the part closer to this click
        const distToStart = index - minIndex;
        const distToEnd = maxIndex - index;
        if (distToStart < distToEnd) {
          setSelectedTimeSlotIndices(selectedTimeSlotIndices.filter(i => i < index));
        } else {
          setSelectedTimeSlotIndices(selectedTimeSlotIndices.filter(i => i > index));
        }
      }
    } else {
      // Add to selection - must be adjacent
      const minIndex = Math.min(...selectedTimeSlotIndices);
      const maxIndex = Math.max(...selectedTimeSlotIndices);

      // Check if click is adjacent
      if (index === minIndex - 1 || index === maxIndex + 1) {
        // Check if all slots between are not booked
        const newMin = Math.min(minIndex, index);
        const newMax = Math.max(maxIndex, index);
        const allAvailable = timeSlots.slice(newMin, newMax + 1).every(slot => !slot.isBooked);

        if (allAvailable) {
          // Create sequential range
          const newSelection = [];
          for (let i = newMin; i <= newMax; i++) {
            newSelection.push(i);
          }
          setSelectedTimeSlotIndices(newSelection);
        }
      } else {
        // Not adjacent - check if we can fill the gap
        const newMin = Math.min(minIndex, index);
        const newMax = Math.max(maxIndex, index);

        // Check if all slots in range are available
        const allAvailable = timeSlots.slice(newMin, newMax + 1).every(slot => !slot.isBooked);

        if (allAvailable) {
          // Create sequential range
          const newSelection = [];
          for (let i = newMin; i <= newMax; i++) {
            newSelection.push(i);
          }
          setSelectedTimeSlotIndices(newSelection);
        }
      }
    }
  };

  // Format time for display (e.g., "5:00 PM")
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Update time range when time slots change
  useEffect(() => {
    if (isCourt && selectedTimeSlotIndices.length > 0 && setTimeRange) {
      const sortedIndices = [...selectedTimeSlotIndices].sort((a, b) => a - b);
      const firstSlot = timeSlots[sortedIndices[0]];
      const lastSlot = timeSlots[sortedIndices[sortedIndices.length - 1]];

      if (firstSlot && lastSlot) {
        setTimeRange({
          from: firstSlot.start.toISOString(),
          to: lastSlot.end.toISOString(),
        });
      }
    }
  }, [selectedTimeSlotIndices, timeSlots, isCourt, setTimeRange]);

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

        <div className="flex justify-center p-8">
          {isCourt ? (
            // Single day calendar for courts
            <Calendar
              mode="single"
              selected={selectedDates[0]}
              onSelect={(date) => {
                if (!date) {
                  setSelectedDates([]);
                  setSelectedTimeSlotIndices([]);
                  setTimeSlots([]);
                  return;
                }

                setSelectedDates([date]);
                setSelectedTimeSlotIndices([]);
              }}
              disabled={isDateDisabled}
              className="rounded-lg border border-gray-200 dark:border-gray-700 w-fit p-6 scale-125"
            />
          ) : (
            // Range calendar for other categories
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
              className="rounded-lg border border-gray-200 dark:border-gray-700 w-fit p-6 scale-125"
            />
          )}
        </div>

        {/* Notes */}
        <div className="mt-6 space-y-2">
          {!isCourt && (
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{t("note")}:</span>
              <span>{t("noteAvailableDate", {date: new Date(property?.availableDate as string).toLocaleDateString("en-GB")})}</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{t("note")}:</span>
            <span>
              {isCourt
                ? t("noteUnavailableSlots")
                : t("noteUnavailableDate")
              }
            </span>
          </div>
        </div>
      </div>

      {/* Time Slot Selector - Court Only */}
      {isCourt && selectedDates.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("selectTimeSlots")}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t("selectTimeSlotDescription")}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              No time slots available for this date.
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
              {timeSlots.map((slot, index) => {
                const isSelected = selectedTimeSlotIndices.includes(index);
                const isDisabled = slot.isBooked;

                return (
                  <button
                    key={index}
                    onClick={() => handleTimeSlotClick(index)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all",
                      "flex items-center justify-center gap-2",
                      isDisabled
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : isSelected
                        ? "bg-main-500 text-white shadow-md"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-main-300 dark:hover:border-main-600"
                    )}
                  >
                    {isSelected && (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span>
                      {formatTime(slot.start)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedTimeSlotIndices.length > 0 && timeSlots.length > 0 && (
            (() => {
              const minIndex = Math.min(...selectedTimeSlotIndices);
              const maxIndex = Math.max(...selectedTimeSlotIndices);
              const firstSlot = timeSlots[minIndex];
              const lastSlot = timeSlots[maxIndex];

              // Only display if slots are valid
              if (!firstSlot || !lastSlot) return null;

              return (
                <div className="mt-4 p-3 bg-main-50 dark:bg-main-900/20 rounded-lg border border-main-200 dark:border-main-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Selected: {formatTime(firstSlot.start)} - {formatTime(lastSlot.end)}
                  </p>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Selected Dates Count */}
      {selectedDates.length > 0 && !isCourt && (
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
          (isCourt && selectedTimeSlotIndices.length === 0)
        }
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("next")}
      </Button>
    </div>
  );
}
