"use client";

import { Wrench } from "lucide-react";
import { RequestCardProps } from "./types";
import { BaseRequestCard } from "./base-request-card";

export function ServiceRequestCard(props: RequestCardProps) {
  return (
    <BaseRequestCard
      {...props}
      icon={<Wrench className="h-6 w-6 text-main-600" />}
      showAmount={false}
    />
  );
}
