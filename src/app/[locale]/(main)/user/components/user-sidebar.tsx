"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import {
  User,
  Lock,
  Wallet,
  Bookmark,
  FileText,
  Home,
  Receipt,
  HelpCircle,
  MessageCircle,
  Heart,
  Gift,
} from "lucide-react";

import Typography from "@/components/shared/typography";
import { cn, getLocalizedPath } from "@/lib/utils";
import { useLevels } from "@/hooks/use-levels";
import Image from "next/image";

interface UserSidebarProps {
  currentPath?: string;
  onNavigate?: () => void;
}

const navLinks = [
  { to: "/user/profile", text: "profile", icon: User },
  { to: "/user/rewards", text: "rewards", icon: Gift },
  { to: "/user/change-password", text: "change-password", icon: Lock },
  { to: "/user/saved", text: "saved", icon: Bookmark },
  { to: "/user/following", text: "following", icon: Heart },
  { to: "/user/my-requests", text: "my-requests", icon: FileText },
  { to: "/user/my-real-estates", text: "my-real-estates", icon: Home }
];

export default function UserSidebar({ currentPath, onNavigate }: UserSidebarProps) {
  const t = useTranslations("User.Sidebar");
  const { data: session } = useSession();
  const locale = useLocale();

  const isActive = (path: string) => {
    if (!currentPath) return false;
    return currentPath.includes(path);
  };

  const { data: levels } = useLevels()
  const userLevel = levels?.find(level => level._id === session?.user?.level)
  console.log('User Level:', userLevel);

  return (
    <div className="flex h-screen flex-col bg-white lg:rounded-xl lg:border lg:border-main-100 lg:shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <Typography variant="h4" as="h4" className="font-bold text-gray-900">
          {session?.user?.name || t("account")}
        </Typography>
        {session?.user?.email && (
          <Typography variant="body-sm" as="p" className="mt-1 text-gray-500">
            {session.user.email}
          </Typography>
        )}
        {userLevel && (
          <Link href={getLocalizedPath("/user/levels", locale)}>
            <Typography variant="body-sm" as="p" className="mt-1 font-semibold hover:underline text-gray-500">
              {userLevel.title}
            </Typography>
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);

          return (
            <Link
              key={link.to}
              href={getLocalizedPath(link.to, locale)}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200",
                locale === "ar" ? "flex-row-reverse text-right" : "",
                active
                  ? "bg-main-600 text-white font-semibold shadow-sm hover:bg-main-700"
                  : "text-gray-700 hover:bg-main-50 hover:text-main-600"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <Typography variant="body-md" as="span" className="flex-1">
                {t(link.text)}
              </Typography>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Links - Fixed at bottom */}
      <div className="border-t border-gray-200 p-4 space-y-1">
        <Link
          href={getLocalizedPath("/user/faqs", locale)}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200",
            locale === "ar" ? "flex-row-reverse text-right" : "",
            isActive("/user/faqs")
              ? "bg-main-600 text-white font-semibold shadow-sm hover:bg-main-700"
              : "text-gray-700 hover:bg-main-50 hover:text-main-600"
          )}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          <Typography variant="body-md" as="span" className="flex-1">
            {t("faqs")}
          </Typography>
        </Link>

        <Link
          href={getLocalizedPath("/user/contact-us", locale)}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200",
            locale === "ar" ? "flex-row-reverse text-right" : "",
            isActive("/contact-us")
              ? "bg-main-600 text-white font-semibold shadow-sm hover:bg-main-700"
              : "text-gray-700 hover:bg-main-50 hover:text-main-600"
          )}
        >
          <MessageCircle className="h-5 w-5 shrink-0" />
          <Typography variant="body-md" as="span" className="flex-1">
            {t("contact-us")}
          </Typography>
        </Link>
      </div>
    </div>
  );
}
