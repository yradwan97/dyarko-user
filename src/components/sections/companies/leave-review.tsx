"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Star, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { addReview } from "@/lib/services/api/companies";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/shared/button";
import Typography from "@/components/shared/typography";
import { cn } from "@/lib/utils";

interface LeaveReviewProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  ownerId: string;
  onSuccess: () => void;
}

export default function LeaveReview({
  visible,
  setVisible,
  ownerId,
  onSuccess,
}: LeaveReviewProps) {
  const [rate, setRate] = useState(0);
  const [hoverRate, setHoverRate] = useState(0);
  const [comment, setComment] = useState("");
  const t = useTranslations("Companies.Details.Reviews");

  const { mutate, isSuccess, isPending, reset } = useMutation({
    mutationFn: addReview,
    onSuccess: () => {
      onSuccess();
      setRate(0);
      setComment("");
      setTimeout(() => {
        reset();
        setVisible(false);
      }, 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rate > 0 && comment.trim()) {
      mutate({ owner: ownerId, rate, comment });
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setVisible(false);
      setRate(0);
      setComment("");
      reset();
    }
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-sm bg-black/60 dark:bg-black/80" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border-0 bg-white p-6 shadow-xl duration-200 dark:bg-gray-900 sm:max-w-[500px]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <DialogPrimitive.Title className="border-b border-gray-200 pb-4 text-left text-lg font-semibold dark:border-gray-700">
            {t("new")}
          </DialogPrimitive.Title>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-gray-950 dark:focus:ring-gray-300">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          {isSuccess ? (
            <div className="py-8 text-center">
              <Typography variant="body-md" as="p">
                {t("thank-you")}
              </Typography>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const starValue = index + 1;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setRate(starValue)}
                        onMouseEnter={() => setHoverRate(starValue)}
                        onMouseLeave={() => setHoverRate(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`h-10 w-10 transition-colors ${
                            starValue <= (hoverRate || rate)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-300 text-gray-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px] resize-none border-gray-300 focus:border-main-400 focus:ring-main-400"
                  placeholder={t("review-placeholder") || "Write your review..."}
                  required
                />
              </div>

              <Button
                variant="primary"
                className="w-full py-3"
                type="submit"
                disabled={isPending || rate === 0 || !comment.trim()}
              >
                {isPending ? t("submitting") || "Submitting..." : t("submit")}
              </Button>
            </form>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
