"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Policy {
  _id: string;
  type: string;
  file: string | null;
  contentAr: string;
  contentEn: string;
  createdAt: string;
  updatedAt: string;
}

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: Policy[];
}

export function RefundModal({ isOpen, onClose, policies }: RefundModalProps) {
  const locale = useLocale();
  const t = useTranslations("SignUp.Modals");

  if (!policies || policies.length === 0) return null;

  const content = locale === "ar" ? policies[0]?.contentAr : policies[0]?.contentEn;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t("refund.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-1 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          <div className="space-y-4">
            <div
              className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {policies[0]?.file && (
              <div
                className={`flex w-full items-center border-t pt-4 ${
                  locale === "ar" ? "justify-end" : "justify-start"
                }`}
              >
                <Button
                  asChild
                  className="bg-main-500 hover:bg-main-600 text-white"
                  size="sm"
                >
                  <Link
                    href={policies[0].file}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("view-file")}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
