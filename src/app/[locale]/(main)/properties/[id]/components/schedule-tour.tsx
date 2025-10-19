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
  const [comment, setComment] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (visible) {
      const fetchAvailableTimeSlots = async () => {
        try {
          const response = await axiosClient.get(`/Schedules/${ownerId}`);
          setAvailableTimeSlots(response.data.data);
        } catch (error) {
          console.error("Error fetching unavailable time slots:", error);
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !phoneNumber) {
      toast.error(t("missing-fields"));
      return;
    }

    const tourData: any = {
      date: format(new Date(selectedDate), "yyyy/MM/dd"),
      phone: phoneNumber,
      property: propertyId,
    };
    if (comment) tourData.comment = comment;

    try {
      await axiosClient.post("/tours", tourData);
      toast.success(t("success"));
      setVisible(false);
      setComment("");
      setPhoneNumber("");
      setSelectedDate(undefined);
    } catch (error) {
      toast.error(t("error"));
    }
  };

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
            {/* Calendar */}
            <div className="w-full lg:w-1/2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              {availableTimeSlots.length > 0 && (
                <div className="mt-5 text-center">
                  <p className="text-lg font-medium">
                    {t("available-slots")}
                    <div className="mt-2 flex w-auto justify-center rounded-lg bg-orange-500 p-1 text-white shadow-lg shadow-gray-400">
                      {`${getDisplayTime(availableTimeSlots[0].from)} - ${getDisplayTime(
                        availableTimeSlots[0].to
                      )}`}
                    </div>
                  </p>
                </div>
              )}
            </div>

            {/* Form */}
            <form className="w-full lg:w-1/2" onSubmit={onSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">{t("Phone.label")}</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t("Phone.placeholder")}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="comment">{t("Comment.label")}</Label>
                  <Textarea
                    id="comment"
                    rows={6}
                    placeholder={t("Comment.placeholder")}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="mt-4 flex justify-end">
            <Button className="rounded-lg px-8 py-2" onClick={onSubmit}>
              {t("add")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
