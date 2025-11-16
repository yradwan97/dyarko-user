"use client";

import { useTranslations } from "next-intl";
import { FileCheck } from "lucide-react";
import { RequestCardProps } from "./types";
import { BaseRequestCard } from "./base-request-card";

export function DisclaimerRequestCard(props: RequestCardProps) {
  const t = useTranslations("User.MyRequests");

  return (
    <BaseRequestCard
      {...props}
      icon={<FileCheck className="h-6 w-6 text-main-600" />}
      dateLabel={`${t("tour-date")}: `}
      showAmount={false}
    />
  );
}
