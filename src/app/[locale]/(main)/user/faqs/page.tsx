"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Typography from "@/components/shared/typography";
import { useFAQs } from "@/hooks/use-faqs";
import { cn } from "@/lib/utils";

export default function FAQsPage() {
  const t = useTranslations("User.FAQs");
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useFAQs(currentPage, itemsPerPage);

  const totalPages = data?.pages || 1;
  const faqs = data?.data || [];

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("border-b border-gray-200 pb-4", locale === "ar" && "text-right")}>
        <Typography variant="h3" as="h1" className="font-bold text-gray-900">
          {t("title")}
        </Typography>
        <Typography variant="body-md" as="p" className="mt-2 text-gray-600">
          {t("description")}
        </Typography>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="h-12 w-12 text-main-400" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <Typography variant="body-md" as="p" className="text-red-600">
            {t("error")}
          </Typography>
        </div>
      )}

      {/* FAQs List */}
      {!isLoading && !error && faqs.length > 0 && (
        <div className="space-y-4">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq._id}
                value={faq._id}
                className="rounded-lg border border-gray-200 bg-white px-4 shadow-sm"
              >
                <AccordionTrigger
                  className={cn(
                    "py-4 hover:no-underline justify-between",
                    locale === "ar" ? "text-right flex-row-reverse" : "text-left"
                  )}
                >
                  <Typography variant="body-md-bold" as="span" className={cn("font-semibold text-gray-900", locale === "ar" && "text-right")}>
                    {locale === "ar" ? faq.titleAr : faq.titleEn}
                  </Typography>
                </AccordionTrigger>
                <AccordionContent className={cn("pb-4 pt-1", locale === "ar" && "text-right")}>
                  <Typography variant="body-md" as="p" className={cn("text-gray-600 leading-relaxed", locale === "ar" && "text-right")}>
                    {locale === "ar" ? faq.descriptionAr : faq.descriptionEn}
                  </Typography>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={cn("flex items-center justify-between border-t border-gray-200 pt-6", locale === "ar" && "flex-row-reverse")}>
              <Typography variant="body-sm" as="p" className="text-gray-600">
                {t("showing-page", { currentPage, totalPages, itemsCount: data?.itemsCount || 0 })}
              </Typography>

              <div className={cn("flex items-center gap-2", locale === "ar" && "flex-row-reverse")}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={cn("gap-2", locale === "ar" && "flex-row-reverse")}
                >
                  {locale === "ar" ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                  {t("previous")}
                </Button>

                <Typography variant="body-sm" as="span" className="px-3 text-gray-700">
                  {currentPage} / {totalPages}
                </Typography>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={cn("gap-2", locale === "ar" && "flex-row-reverse")}
                >
                  {t("next")}
                  {locale === "ar" ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && faqs.length === 0 && (
        <div className="py-12 text-center">
          <Typography variant="body-md" as="p" className="text-gray-500">
            {t("no-faqs")}
          </Typography>
        </div>
      )}
    </div>
  );
}
