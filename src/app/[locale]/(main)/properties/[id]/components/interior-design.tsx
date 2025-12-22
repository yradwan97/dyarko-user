"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import HeadTitle from "./head-title";
import Typography from "@/components/shared/typography";

interface InteriorDesignProps {
  interiorDesign?: string | null;
}

export default function InteriorDesign({ interiorDesign }: InteriorDesignProps) {
  const locale = useLocale();
  const t = useTranslations("Properties.Details");
  const [isOpen, setIsOpen] = useState(false);

  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== "string" || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validInteriorDesign = isValidImageUrl(interiorDesign) ? interiorDesign : null;

  return (
    <>
      {/* Image Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0">
          <VisuallyHidden>
            <DialogTitle>{t("interior")}</DialogTitle>
          </VisuallyHidden>
          <div className="relative h-[80vh] w-full">
            {validInteriorDesign && (
              <Image
                src={validInteriorDesign}
                alt={t("interior")}
                fill
                quality={95}
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 mb-8" dir={locale === "ar" ? "rtl" : "ltr"}>
        <HeadTitle text={t("interior")} className="mb-6" />

        {validInteriorDesign ? (
          <div
            className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer max-h-[300px]"
            onClick={() => setIsOpen(true)}
          >
            <Image
              src={validInteriorDesign}
              alt={t("interior")}
              width={800}
              height={400}
              quality={90}
              sizes="(max-width: 768px) 100vw, 66vw"
              className="w-full h-auto object-cover max-h-[300px]"
            />
          </div>
        ) : (
          <Typography
            variant="body-md"
            as="p"
            className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            {t("no-data")}
          </Typography>
        )}
      </div>
    </>
  );
}
