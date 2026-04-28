"use client";

import { useMemo, useState } from "react";
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
import DOMPurify from "dompurify";
import PaginationControls from "@/components/shared/pagination-controls";

export default function FAQsPage() {
  const t = useTranslations("User.FAQs");
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useFAQs(currentPage);

  const faqs = data?.data || [];

  // Recommended config — adjust ALLOWED_TAGS / ALLOWED_ATTR as needed
  const purifyConfig = useMemo(
    () => ({
      ALLOWED_TAGS: [
        "p",
        "div",
        "span",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "ul",
        "ol",
        "li",
        // "a", "h1", "h2", "h3"  ← add only if you really need them
      ],
      ALLOWED_ATTR: ["class"], // keeps ql-direction-rtl etc.
      FORBID_TAGS: ["script", "iframe", "object", "embed", "style", "form", "svg"],
    }),
    []
  );

  // Optional: helper to get sanitized content
  const getSanitized = (html?: string) =>
    html ? DOMPurify.sanitize(html, purifyConfig) : "";

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
            {faqs.map((faq) => {
              const title =
                locale === "ar" ? faq.titleAr : faq.titleEn;
              const description =
                locale === "ar" ? faq.descriptionAr : faq.descriptionEn;

              const safeTitle = getSanitized(title);
              const safeDescription = getSanitized(description);
              console.log("Rendering FAQ:", { title, description, safeTitle, safeDescription });

              return (
                <AccordionItem
                  key={faq._id}
                  value={faq._id}
                  className="rounded-lg border border-gray-200 bg-white px-4 shadow-sm"
                >
                  <AccordionTrigger
                    className={cn(
                      "py-4 hover:no-underline justify-between",
                      locale === "ar" ? "text-right" : "text-left"
                    )}
                  >
                    {/* Title – usually short, but sanitized anyway */}
                    <span
                      className={cn(
                        "font-semibold text-gray-900",
                        locale === "ar" && "text-right"
                      )}
                      dangerouslySetInnerHTML={{ __html: safeTitle }}
                    />
                  </AccordionTrigger>

                  <AccordionContent className={cn("pb-4 pt-1", locale === "ar" && "text-right")}>
                    <div
                      className={cn(
                        "text-gray-600 leading-relaxed prose prose-sm max-w-none",
                        locale === "ar" && "text-right"
                      )}
                      dangerouslySetInnerHTML={{ __html: safeDescription }}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            totalPages={data?.pages || 1}
          />
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
