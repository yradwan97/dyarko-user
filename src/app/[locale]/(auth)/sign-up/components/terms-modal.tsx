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

interface Term {
  _id: string;
  type: string;
  file: string | null;
  contentAr: string;
  contentEn: string;
  createdAt: string;
  updatedAt: string;
}

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  terms: Term[];
}

export function TermsModal({ isOpen, onClose, terms }: TermsModalProps) {
  const locale = useLocale();
  const t = useTranslations("SignUp.Modals");

  if (!terms || terms.length === 0) return null;

  const content = locale === "ar" ? terms[0]?.contentAr : terms[0]?.contentEn;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            {t("terms.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto px-1 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          <div className="space-y-4">
            <div
              className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {terms[0]?.file && (
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
                    href={terms[0].file}
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
