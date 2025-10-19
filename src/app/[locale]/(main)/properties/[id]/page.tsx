"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import PropertyDetails from "./property-details";

export default function PropertyDetailsPage() {
  const { id } = useParams();

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <PropertyDetails id={id as string} />
    </Suspense>
  );
}
