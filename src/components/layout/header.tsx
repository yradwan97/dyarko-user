"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { BellIcon, BookmarkIcon, MapPinIcon, MenuIcon, SearchIcon, SlidersHorizontalIcon, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import Navbar from "./header/navbar";
import MobileSidebar from "./header/mobile-sidebar";
import NotificationDropdown from "./header/notification-dropdown";
import LocalizationDropdown from "./header/localization-dropdown";
import UserProfilePopover from "./header/user-profile-popover";
import Button from "@/components/shared/button";
import { useGetNotifications, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import type { Notification } from "@/types";
import { cn, getLocalizedPath } from "@/lib/utils";

export default function Header() {
  const t = useTranslations("General");
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();
  const [notificationCount, setNotificationCount] = useState(0);
  // const { data, isSuccess, refetch } = useGetNotifications();
  const markAllReadMutation = useMarkAllNotificationsRead();  

  // useEffect(() => {
  //   if (session) {
  //     refetch();
  //   }
  // }, [session, refetch]);

  // useEffect(() => {
  //   if (isSuccess && data?.data) {
  //     const unreadNotifications = data.data.filter((n) => !n.is_read);
  //     setNotifications(unreadNotifications);
  //     setNotificationCount(unreadNotifications?.length || 0);
  //   }
  // }, [data, isSuccess]);

  // const handleReadAllNotifications = () => {
  //   markAllReadMutation.mutate(undefined, {
  //     onSuccess: () => {
  //       refetch();
  //     },
  //   });
  // };

  return (
    <>
      <header className="top-0 z-20 bg-white shadow-md sm:sticky dark:bg-gray-800 dark:shadow-gray-700/50">
        {/* Top row - Location, Navigation, Icons */}
        <div
          className={`mx-auto flex ${locale === "en" ? "flex-row" : "flex-row-reverse"} items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 lg:px-10 dark:border-gray-700`}
        >
          {/* Logo and Location */}
          <div className={`flex ${locale === "en" ? "flex-row" : "flex-row-reverse"} items-center gap-3`}>
            <Link href={getLocalizedPath("/", locale)} className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt={t("logoAlt")}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </Link>
            <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
              <MapPinIcon className="h-4 w-4" />
              <span>{t("defaultLocation")}</span>
            </button>
          </div>

          {/* Center navigation */}
          <nav
            className="hidden flex-1 items-center justify-center lg:flex lg:flex-row"
          >
            <Navbar />
          </nav>

          {/* Right side icons */}
          {session ? (
            <div
              className={`flex ${locale === "en" ? "flex-row" : "flex-row-reverse"} items-center gap-2 sm:gap-3`}
            >
              <LocalizationDropdown />

              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                <BookmarkIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                    <BellIcon className="relative z-10 h-5 w-5 text-gray-700 dark:text-gray-300" />
                    {notificationCount > 0 && (
                      <span className="absolute -right-1 -top-1 z-20 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                        {notificationCount < 9 ? notificationCount : "9+"}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                {/* <NotificationDropdown
                  onReadAll={handleReadAllNotifications}
                  notifications={notifications}
                /> */}
              </DropdownMenu>

              <UserProfilePopover
                userName={session.user?.name || t("defaultUser")}
                userEmail={session.user?.email || undefined}
                userImage={session.user?.image || undefined}
              />

              <button
                className="inline-block lg:hidden"
                onClick={() => setVisible(true)}
              >
                <MenuIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          ) : (
            <>
              <div
                className={`hidden md:flex ${locale === "en" ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-3`}
              >
                <LocalizationDropdown />
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                      <span>{t("helloSignIn")}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4" align={locale === "ar" ? "start" : "end"}>
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        to={getLocalizedPath("/login", locale)}
                        className="w-full"
                      >
                        {t("login")}
                      </Button>
                      <Button
                        variant="primary-outline"
                        to={getLocalizedPath("/sign-up", locale)}
                        className="w-full"
                      >
                        {t("sign-up")}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <button
                className="inline-block md:hidden"
                onClick={() => setVisible(true)}
              >
                <MenuIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
            </>
          )}
        </div>

        {/* Bottom row - Search bar */}
        {/* {session && (
          <div className="mx-auto px-4 py-3 lg:px-10">
            <div className="relative flex items-center gap-2">
              <SearchIcon className="absolute left-3 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder={t("searchPlaceholder")}
                className="h-11 pl-10 pr-4"
              />
              <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:bg-gray-50">
                <SlidersHorizontalIcon className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        )} */}
      </header>
      <MobileSidebar visible={visible} setVisible={setVisible} />
    </>
  );
}
