"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { HomeIcon } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import FullPageLoader from "@/components/shared/full-page-loader";
import type { Notification } from "@/types";
import { getLocalizedPath } from "@/lib/utils";

type NotificationDropdownProps = {
  notifications: Notification[];
  onReadAll: () => void;
};

export default function NotificationDropdown({
  notifications,
  onReadAll,
}: NotificationDropdownProps) {
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Notifications.Dropdown");

  const goToNotifications = () => {
    setIsLoading(true);
    router.push(getLocalizedPath("/notifications", locale));
  };

  if (isLoading) return <FullPageLoader />;

  return (
    <DropdownMenuContent
      align="end"
      className={`z-[999] flex w-60 flex-col rounded-lg bg-white py-5 drop-shadow-md sm:w-[320px] md:w-[400px] ${
        locale === "ar" ? "right-14 sm:right-5 md:left-0" : "-right-14 sm:-right-5 md:right-0"
      }`}
    >
      <div className="max-h-[350px] space-y-6 overflow-y-auto md:max-h-[450px]">
        <Typography
          variant="body-md-bold"
          as="h4"
          className="px-5 capitalize text-gray-900"
        >
          {t("title")}
        </Typography>
        <div>
          <div>
            {notifications.length > 0 ? (
              notifications.map((n, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={goToNotifications}
                  className="mx-1 my-1 flex cursor-pointer space-x-4 rounded-md border-b border-gray-300 bg-main-200 px-5 py-3 last:border-b-0 hover:bg-main-100"
                >
                  <div>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600">
                      <HomeIcon className="h-3 w-3 text-white" />
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Typography
                      variant="body-sm-bold"
                      as="h6"
                      className="capitalize text-black"
                    >
                      {locale === "en" ? n.title_en : n.title_ar}
                    </Typography>
                    <Typography
                      variant="body-xs-medium"
                      as="p"
                      className="text-gray-600"
                    >
                      {locale === "en" ? n.body_en : n.body_ar}
                    </Typography>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="text-center">
                <Typography as="h3" variant="body-md-medium">
                  {t("no-new")}
                </Typography>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row justify-evenly">
          <Button
            to={getLocalizedPath("/notifications", locale)}
            className="block text-center text-sm font-bold text-main-600"
            onClick={goToNotifications}
          >
            {t("see-all")}
          </Button>
          {notifications.length > 0 && (
            <Button
              className="block text-center text-sm font-bold text-main-600"
              onClick={onReadAll}
            >
              {t("read-all")}
            </Button>
          )}
        </div>
      </div>
    </DropdownMenuContent>
  );
}
