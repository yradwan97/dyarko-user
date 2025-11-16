"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Typography from "@/components/shared/typography";
import { getProxiedImageUrl } from "@/lib/utils";
import { OwnerImageProps } from "./types";

export function OwnerImage({ owner }: OwnerImageProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [owner.image]);

  const hasValidImage = owner.image && (owner.image.startsWith('/') || owner.image.startsWith('http'));

  if (hasValidImage && !imageError) {
    return (
      <Image
        src={getProxiedImageUrl(owner.image)}
        alt={owner.name}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-main-400 to-main-600 flex items-center justify-center">
      <Typography variant="body-sm" as="span" className="font-bold text-white">
        {owner.name?.charAt(0).toUpperCase() || "?"}
      </Typography>
    </div>
  );
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatStatus = (status: string) => {
  if (!status) return "";
  return status
    .toLowerCase()
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getStatusColor = (status: string) => {
  const normalizedStatus = status?.toLowerCase() || "";
  switch (normalizedStatus) {
    case "approved":
    case "accepted":
    case "completed":
    case "confirmed":
      return "text-green-600 bg-green-50 border-green-200";
    case "replied":
      return "text-green-600 bg-green-50 border-green-200";
    case "pending":
    case "under_review":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "rejected":
    case "cancelled":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};
