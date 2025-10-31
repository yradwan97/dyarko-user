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
  const [phoneNumber, setPhoneNumber] = useState("");

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

  const getDisplayTime = (timeslot: string) => {
    const date = new Date(timeslot);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !phoneNumber) {
      toast.error(t("missing-fields"));
      return;
    }

    const tourData = {
      property: propertyId,
      date: format(new Date(selectedDate), "MM/dd/yyyy"),
      mobileNumber: phoneNumber,
    };

    try {
      await axiosClient.post("/tours", tourData);
      toast.success(t("success"));
      setVisible(false);
      setPhoneNumber("");
      setSelectedDate(undefined);
    } catch (error) {
      toast.error(t("error"));
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div className="flex flex-col items-center justify-start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => !isDateAvailable(date)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 w-fit p-3"
              />
            </div>

            {/* Form Section */}
            <div className="flex flex-col justify-center">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("Phone.label")}
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder={t("Phone.placeholder")}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  required
                />
              </div>
            </div>
          </div>

          {/* Available Time Slots */}
          {availableTimeSlots.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("available-slots")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableTimeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {`${getDisplayTime(slot.from)} - ${getDisplayTime(slot.to)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisible(false)}
              className="px-6 h-11 font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              className="px-8 h-11 font-semibold bg-main-500 hover:bg-main-500/90 text-white shadow-sm hover:shadow-md transition-all"
            >
              {t("add")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
