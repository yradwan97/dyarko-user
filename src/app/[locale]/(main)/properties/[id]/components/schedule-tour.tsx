"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { axiosClient } from "@/lib/services/axios-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { roundUpToHalfHour, roundDownToHalfHour, formatTimeHHMM } from "@/lib/utils";

interface ScheduleTourProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  ownerId: string;
  propertyId: string;
}

export default function ScheduleTour({
  visible,
  setVisible,
  ownerId,
  propertyId,
}: ScheduleTourProps) {
  const { data: session } = useSession();
  const t = useTranslations("Properties.Details.Tour");
  const {
    register,
    formState: { errors },
  } = useForm();

  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userComment, setUserComment] = useState("");

  useEffect(() => {
    if (visible && ownerId) {
      const fetchAvailableTimeSlots = async () => {
        try {
          const response = await axiosClient.get(`/schedules?owner=${ownerId}`);
          setAvailableTimeSlots(response.data.data.data || []);
        } catch (error) {
          console.error("Error fetching schedules:", error);
          setAvailableTimeSlots([]);
        }
      };
      fetchAvailableTimeSlots();
    }
  }, [ownerId, visible]);

  // Get normalized display times for a slot (start rounds UP, end rounds DOWN)
  const getNormalizedSlotTimes = (slot: { from: string; to: string }) => {
    const fromDate = new Date(slot.from);
    const toDate = new Date(slot.to);

    const normalizedStart = roundUpToHalfHour(fromDate);
    const normalizedEnd = roundDownToHalfHour(toDate);

    return {
      start: normalizedStart,
      end: normalizedEnd,
      startTime: formatTimeHHMM(normalizedStart),
      endTime: formatTimeHHMM(normalizedEnd),
    };
  };

  const isDateAvailable = (date: Date) => {
    if (!availableTimeSlots || availableTimeSlots.length === 0) return false;

    const checkDate = new Date(date.setHours(0, 0, 0, 0));

    return availableTimeSlots.some((slot) => {
      const from = new Date(new Date(slot.from).setHours(0, 0, 0, 0));
      const to = new Date(new Date(slot.to).setHours(0, 0, 0, 0));
      return checkDate >= from && checkDate <= to;
    });
  };

  const getAvailableTimeSlotsForDate = (date: Date) => {
    if (!date || !availableTimeSlots || availableTimeSlots.length === 0) return [];

    const checkDate = new Date(date.setHours(0, 0, 0, 0));

    return availableTimeSlots.filter((slot) => {
      const from = new Date(new Date(slot.from).setHours(0, 0, 0, 0));
      const to = new Date(new Date(slot.to).setHours(0, 0, 0, 0));
      return checkDate >= from && checkDate <= to;
    });
  };

  const generateTimeOptions = () => {
    if (!selectedDate) return [];

    const selectedSlots = getAvailableTimeSlotsForDate(selectedDate);
    if (selectedSlots.length === 0) return [];

    const timeOptions: string[] = [];

    selectedSlots.forEach((slot) => {
      const { start: normalizedStart, end: normalizedEnd } = getNormalizedSlotTimes(slot);

      // Skip invalid slots where normalized end is before or equal to normalized start
      if (normalizedEnd <= normalizedStart) return;

      let current = new Date(normalizedStart);

      while (current <= normalizedEnd) {
        timeOptions.push(formatTimeHHMM(current));

        // Add 30 minutes
        current = new Date(current.getTime() + 30 * 60 * 1000);
      }
    });

    return [...new Set(timeOptions)].sort();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !phoneNumber) {
      toast.error(t("missing-fields"));
      return;
    }

    // Combine date and time
    const [hours, minutes] = selectedTime.split(":");
    const dateWithTime = new Date(selectedDate);
    dateWithTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Format as "mm/dd/yyyy hh:mm"
    const formattedDate = format(dateWithTime, "MM/dd/yyyy HH:mm");

    const tourData = {
      property: propertyId,
      date: formattedDate,
      mobileNumber: phoneNumber,
      userComment: userComment,
    };

    try {
      await axiosClient.post("/tours", tourData);
      toast.success(t("success"));
      setVisible(false);
      setPhoneNumber("");
      setSelectedDate(undefined);
      setSelectedTime("");
      setUserComment("");
    } catch (error) {
      toast.error(t("error"));
    }
  };

  const availableTimesForSelectedDate = generateTimeOptions();
  const selectedDateSlots = selectedDate ? getAvailableTimeSlotsForDate(selectedDate) : [];

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl text-center font-bold text-gray-900 dark:text-white">
            {t("title") || "Schedule a tour"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="px-6 pb-6 space-y-6">
          {/* Calendar */}
          <div className="flex justify-center" dir="ltr">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedTime("");
              }}
              disabled={(date) => !isDateAvailable(date)}
              className="border-0"
            />
          </div>

          {/* Time Selector */}
          {selectedDate && availableTimesForSelectedDate.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">
                {t("time-label")}
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-full h-12 bg-gray-50 dark:bg-gray-900">
                  <SelectValue placeholder={t("select-time-placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {availableTimesForSelectedDate.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Schedule Available Info */}
          {selectedDateSlots.length > 0 && (
            <div className="space-y-2">
              {selectedDateSlots.map((slot, index) => {
                const { startTime, endTime } = getNormalizedSlotTimes(slot);
                return (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {t("schedule-available")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {startTime} - {endTime}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phone Number */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              {t("Phone.label")}
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="tel"
                placeholder={t("Phone.placeholder")}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                required
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              {t("Comment.label")}
            </Label>
            <Textarea
              placeholder={t("Comment.placeholder")}
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="min-h-[100px] bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Confirm Button */}
          <Button
            type="submit"
            disabled={!selectedDate || !selectedTime || !phoneNumber}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("add")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
