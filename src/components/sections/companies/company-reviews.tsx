"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { getOwnerReviews } from "@/lib/services/api/companies";
import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SingleReview from "./single-review";
import LeaveReview from "./leave-review";
import PaginationControls from "@/components/shared/pagination-controls";
import { Spinner } from "@/components/ui/spinner";

interface CompanyReviewsProps {
  ownerId: string;
}

const REVIEWS_PER_PAGE = 9;

export default function CompanyReviews({ ownerId }: CompanyReviewsProps) {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const t = useTranslations("Companies.Details.Reviews");
  const tGeneral = useTranslations("General");

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["owner-reviews", ownerId, currentPage],
    queryFn: () => getOwnerReviews({ ownerId, page: currentPage, size: REVIEWS_PER_PAGE }),
    enabled: !!ownerId,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="mt-24 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5 md:px-10">
          <Typography variant="h4" as="h4" className="text-xl text-black">
            {t("title")}
          </Typography>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="primary"
                  className="flex items-center !px-3 !py-2 text-sm md:!px-4 md:!py-3"
                  onClick={() => setVisible(true)}
                  disabled={!session}
                >
                  <Plus className="h-4 w-4 stroke-white md:mr-2" />
                  <span className="hidden md:inline">{t("add")}</span>
                </Button>
              </span>
            </TooltipTrigger>
            {!session && (
              <TooltipContent side="bottom">
                {tGeneral("login-required")}
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        <div className="p-4 md:p-10">
          {isError && (
            <Typography variant="body-md" as="p" className="text-gray-400">
              {t("failed")}
            </Typography>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-12 w-12 text-main-400" />
            </div>
          ) : (
            <>
              {data && data.reviews.length > 0 ? (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data.reviews.map((review) => (
                      <SingleReview key={review._id} review={review} />
                    ))}
                  </div>
                  {data.pages > 1 && (
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={data.pages}
                      onPageChange={handlePageChange}
                      disabled={isFetching}
                    />
                  )}
                </>
              ) : (
                <Typography variant="body-md" as="p" className="text-gray-400">
                  {t("no-reviews")}
                </Typography>
              )}
            </>
          )}

        </div>
      </div>

      <LeaveReview
        visible={visible}
        setVisible={setVisible}
        ownerId={ownerId}
        onSuccess={() => refetch()}
      />
    </>
  );
}
