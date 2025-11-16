"use client";

import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import { RequestCardProps } from "./types";
import { BaseRequestCard } from "./base-request-card";

export function TourRequestCard(props: RequestCardProps) {
  const t = useTranslations("User.MyRequests");

  return (
    <BaseRequestCard
      {...props}
      icon={<Calendar className="h-6 w-6 text-main-600" />}
      dateLabel={`${t("tour-date")}: `}
      showAmount={false}
    />
  );
}
