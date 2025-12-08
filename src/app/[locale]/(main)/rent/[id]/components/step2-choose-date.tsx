"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { type Property } from "@/lib/services/api/properties";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { axiosClient } from "@/lib/services/axios-client";
import { validateRentTime } from "@/lib/services/api/rents";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Step2ChooseDateProps {
  property: Property;
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
  timeRange?: { from: string; to: string };
  setTimeRange?: (timeRange: { from: string; to: string }) => void;
  selectedTimeSlotIndices?: number[];
  setSelectedTimeSlotIndices?: (indices: number[]) => void;
  selectedRentType?: string;
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
  selectedRentType,
  onNext,
}: Step2ChooseDateProps) {
  const t = useTranslations("Rent.Step2");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [bookedDates, setBookedDates] = useState<BookedDateRange[]>([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

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

  // Helper to check if a date is a weekend day (Thursday=4, Friday=5, Saturday=6)
  const isWeekendDay = (date: Date) => {
    const day = date.getDay();
    return day === 4 || day === 5 || day === 6; // Thursday, Friday, Saturday
  };

  // Helper to check if a date is a weekday (Sunday=0, Monday=1, Tuesday=2, Wednesday=3)
  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 1 || day === 2 || day === 3; // Sunday to Wednesday
  };

  // Check if a date is available (not past, not booked)
  const isDateAvailable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) return false;
    if (isDateBooked(date)) return false;

    return true;
  };

  // Get all 4 weekdays (Sun-Wed) in the same week as the given date (only available ones)
  const getWeekdaysInWeek = (date: Date): Date[] => {
    const dates: Date[] = [];
    const dayOfWeek = date.getDay();

    // Find the Sunday of this week
    const sunday = new Date(date);
    sunday.setHours(0, 0, 0, 0);
    sunday.setDate(date.getDate() - dayOfWeek);

    // Add Sunday (0), Monday (1), Tuesday (2), Wednesday (3) - only if available
    for (let i = 0; i <= 3; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      if (isDateAvailable(d)) {
        dates.push(d);
      }
    }

    return dates;
  };

  // Get all 3 holiday days (Thu-Sat) in the same week as the given date (only available ones)
  const getHolidaysInWeek = (date: Date): Date[] => {
    const dates: Date[] = [];
    const dayOfWeek = date.getDay();

    // Find the Sunday of this week
    const sunday = new Date(date);
    sunday.setHours(0, 0, 0, 0);
    sunday.setDate(date.getDate() - dayOfWeek);

    // Add Thursday (4), Friday (5), Saturday (6) - only if available
    for (let i = 4; i <= 6; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      if (isDateAvailable(d)) {
        dates.push(d);
      }
    }

    return dates;
  };

  // Handle clearing selected dates
  const handleClearDates = () => {
    setSelectedDates([]);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const isPastOrBooked = checkDate < today || isDateBooked(date);

    if (isPastOrBooked) return true;

    // For weekly rent type, only allow dates in weekly increments from the start date
    if (selectedRentType === "weekly" && selectedDates.length > 0 && !isCourt) {
      const startDate = new Date(selectedDates[0]);
      startDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Allow the start date itself, or dates that are exactly multiples of 7 days from start
      const isValidWeeklyIncrement = daysDiff === 0 || (daysDiff > 0 && daysDiff % 7 === 0);

      return !isValidWeeklyIncrement;
    }

    // For weekdays rent type: disable Thursday, Friday, Saturday (only allow Sun-Wed)
    // Also disable if dates are already selected (user must clear first to select different week)
    if (selectedRentType === "weekdays" && !isCourt) {
      if (isWeekendDay(date)) return true;

      // If we have selected dates, disable all other weekdays
      if (selectedDates.length > 0) {
        const isSelected = selectedDates.some(d => {
          const selDate = new Date(d);
          selDate.setHours(0, 0, 0, 0);
          return selDate.getTime() === checkDate.getTime();
        });
        return !isSelected;
      }

      return false;
    }

    // For holidays rent type: enable only Thursday, Friday, Saturday
    // Also disable if dates are already selected (user must clear first to select different week)
    if (selectedRentType === "holidays" && !isCourt) {
      if (isWeekday(date)) return true;

      // If we have selected dates, disable all other holiday days
      if (selectedDates.length > 0) {
        const isSelected = selectedDates.some(d => {
          const selDate = new Date(d);
          selDate.setHours(0, 0, 0, 0);
          return selDate.getTime() === checkDate.getTime();
        });
        return !isSelected;
      }

      return false;
    }

    return false;
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

  // Format date as mm/dd/yyyy
  const formatDateForApi = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Handle next button click with validation for monthly rent type
  const handleNextClick = async () => {
    if (selectedRentType === "monthly" && selectedDates.length >= 2) {
      setValidating(true);
      try {
        const startDate = selectedDates[0];
        const endDate = selectedDates[selectedDates.length - 1];

        const response = await validateRentTime({
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          rentType: "monthly",
          property: property._id,
        });

        if (response.data.isValid) {
          onNext();
        } else {
          toast.error(`${response.data.message} (e.g. 15/10 - 15/11)`);
        }
      } catch (error) {
        console.error("Error validating rent time:", error);
        toast.error(t("validationError"));
      } finally {
        setValidating(false);
      }
    } else {
      onNext();
    }
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
          ) : selectedRentType === "weekdays" || selectedRentType === "holidays" ? (
            // Multiple selection calendar for weekdays/holidays - auto-select all days in the period
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => {
                if (!dates || dates.length === 0) {
                  // Don't allow deselection by clicking - must use clear button
                  return;
                }

                // If we already have dates selected, don't allow changes (must clear first)
                if (selectedDates.length > 0) {
                  return;
                }

                // Get the clicked date (the new one)
                const clickedDate = dates[dates.length - 1];

                if (selectedRentType === "weekdays") {
                  // Auto-select all 4 weekdays in this week
                  const weekdays = getWeekdaysInWeek(clickedDate);
                  setSelectedDates(weekdays);
                } else if (selectedRentType === "holidays") {
                  // Auto-select all 3 holiday days in this week
                  const holidays = getHolidaysInWeek(clickedDate);
                  setSelectedDates(holidays);
                }
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

                // Generate all dates between from and to (inclusive)
                const dates: Date[] = [];
                const current = new Date(range.from);
                current.setHours(0, 0, 0, 0);
                const end = new Date(range.to || range.from);
                end.setHours(23, 59, 59, 999);

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
          {selectedRentType === "monthly" && property?.minMonths && (
            <div className="flex items-start gap-2 text-sm text-main-600 dark:text-main-400">
              <span className="font-medium">{t("note")}:</span>
              <span>{t("noteMinMonths", { months: property.minMonths })}</span>
            </div>
          )}
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
                      {formatTime(slot.start)} - {formatTime(slot.end)}
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

      {/* Selected Dates Count with Clear Button */}
      {selectedDates.length > 0 && !isCourt && (
        <div className={cn(
          "bg-main-50 dark:bg-main-900/20 rounded-xl p-4 border border-main-200 dark:border-main-800 flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {t("selectedDates")}: {selectedDates.length > 1 ? selectedDates.length - 1 : 0}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearDates}
            className={cn(
              "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1",
              isRTL && "flex-row-reverse"
            )}
          >
            <X className="h-4 w-4" />
            {t("clearDates")}
          </Button>
        </div>
      )}

      {/* Next Button */}
      <Button
        onClick={handleNextClick}
        disabled={
          selectedDates.length === 0 ||
          (!isCourt && selectedDates.length < 2) ||
          (isCourt && selectedTimeSlotIndices.length === 0) ||
          validating
        }
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {validating ? t("validating") : t("next")}
      </Button>
    </div>
  );
}
