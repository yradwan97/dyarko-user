"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Plus, ChevronDown } from "lucide-react";
import { getOwnerReviews } from "@/lib/services/api/companies";
import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SingleReview from "./single-review";
import LeaveReview from "./leave-review";
import { Spinner } from "@/components/ui/spinner";

interface CompanyReviewsProps {
  ownerId: string;
}

export default function CompanyReviews({ ownerId }: CompanyReviewsProps) {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [limit, setLimit] = useState(3);
  const t = useTranslations("Companies.Details.Reviews");
  const tGeneral = useTranslations("General");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["owner-reviews", ownerId],
    queryFn: () => getOwnerReviews(ownerId),
    enabled: !!ownerId,
  });

  const visibleReviews = data?.slice(0, limit) || [];
  const hasMore = data && data.length > limit;

  return (
    <>
      <div className="mt-24 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5 md:px-10">
          <Typography variant="h4" as="h4" className="text-xl text-black">
            {t("title")}
          </Typography>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="hidden md:inline-block">
                <Button
                  variant="primary"
                  className="flex items-center p-3! text-sm"
                  onClick={() => setVisible(true)}
                  disabled={!session}
                >
                  {t("add")}
                  <Plus className="ml-2.5 h-4 w-4 stroke-white" />
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
              {data && data.length > 0 ? (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {visibleReviews.map((review) => (
                      <SingleReview key={review._id} review={review} />
                    ))}
                  </div>
                  {hasMore && (
                    <Button
                      variant="primary"
                      onClick={() => setLimit((prev) => prev + 3)}
                      className="group mt-12 flex items-center space-x-2 rounded-lg border border-black p-4 outline-0 transition-colors duration-500 ease-in-out hover:text-white"
                    >
                      <Typography
                        variant="body-md"
                        as="span"
                        className="group-hover:text-white"
                      >
                        {t("more")}
                      </Typography>
                      <ChevronDown className="h-3 w-3 stroke-black stroke-1 group-hover:stroke-white" />
                    </Button>
                  )}
                </>
              ) : (
                <Typography variant="body-md" as="p" className="text-gray-400">
                  {t("no-reviews")}
                </Typography>
              )}
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block md:hidden">
                <Button
                  variant="primary-outline"
                  className="mt-6 flex w-full items-center justify-center !p-3 text-sm"
                  onClick={() => setVisible(true)}
                  disabled={!session}
                >
                  <Plus className="mr-2 h-4 w-4 stroke-white" />
                  {t("add")}
                </Button>
              </span>
            </TooltipTrigger>
            {!session && (
              <TooltipContent side="top">
                {tGeneral("login-required")}
              </TooltipContent>
            )}
          </Tooltip>
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
