"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import Typography from "@/components/shared/typography";
import { getOwners } from "@/lib/services/api/companies";
import CompanyCard from "@/components/sections/companies/company-card";
import PaginationControls from "@/components/shared/pagination-controls";
import { Spinner } from "@/components/ui/spinner";

export default function CompaniesPage() {
  const t = useTranslations("Companies");
  const [page, setPage] = useState(1);
  const size = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["owners", { page, size, type: "owner" }],
    queryFn: () => getOwners({ page, size, type: "owner" }),
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container px-4 py-8 md:px-6">
        <div className="mb-8">
          <Typography variant="h1" as="h1" className="mb-4 text-4xl">
            {t("title")}
          </Typography>
          <Typography variant="body-lg-medium" as="p" className="text-gray-600">
            {t("description")}
          </Typography>
        </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="h-12 w-12 text-main-400" />
        </div>
      )}

      {isError && (
        <Typography variant="body-lg-medium" as="p" className="text-center text-red-500">
          {t("error")}
        </Typography>
      )}

      {!isLoading && !isError && data?.data?.data && data.data.data.length === 0 && (
        <Typography variant="body-lg-medium" as="p" className="text-center text-gray-500">
          {t("no-companies")}
        </Typography>
      )}

      {data?.data?.data && data.data.data.length > 0 && (
        <>
          <div className="grid gap-6">
            {data.data.data.map((owner) => (
              <Link key={owner._id} href={`/companies/${owner._id}`}>
                <CompanyCard owner={owner} />
              </Link>
            ))}
          </div>

          <PaginationControls
            currentPage={page}
            totalPages={data.data.pages}
            onPageChange={setPage}
            disabled={isLoading}
          />
        </>
      )}
      </div>
    </div>
  );
}
