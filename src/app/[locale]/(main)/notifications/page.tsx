"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HomeIcon } from "lucide-react";
import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import PaginationControls from "@/components/shared/pagination-controls";
import { useGetNotifications, useMarkNotificationRead } from "@/hooks/use-notifications";
import { useSession } from "next-auth/react";
import { axiosClient } from "@/lib/services";
import { Loader } from "@/components/shared/loader";
import { Notification } from "@/types";

type Property = {
    _id: string;
    code: string;
    title: string;
    __t: string;
    paciNumber: string[];
};

export default function NotificationsPage() {
    const t = useTranslations("Notifications");
    const locale = useLocale();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [page, setPage] = useState(1);
    const { data: session } = useSession();
    const { data: notificationsData, isLoading, isSuccess } = useGetNotifications(session!, page);
    const markNotificationRead = useMarkNotificationRead()

    useEffect(() => {
        if (isSuccess && notificationsData) {
            setNotifications(notificationsData.data);
        }
    }, [notificationsData]);

    const handleReadAll = async () => {
        try {
            await axiosClient.post("/notifications/read-all");
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={handleReadAll} className="text-md font-medium hover:cursor-pointer bg-main-600 text-white">
                    {t("read-all")}
                </Button>

                <Typography as="h1" variant="h2" className="text-center">
                    {t("title")}
                </Typography>

                <div className="w-auto"></div>


            </div>
            <div className="space-y-4">
                {notifications.length === 0 && (
                    <Typography as="h3" variant="body-md-medium" className="text-center">
                        {t("no-notifications")}
                    </Typography>
                )}

                {notifications.map((n) => (
                    <div
                        key={n._id}
                        onClick={() => markNotificationRead.mutate(n._id)}
                        className={`relative flex items-center gap-4 p-4 rounded-lg border shadow-sm transition-colors hover:cursor-pointer duration-150
                            ${n.isRead ? "border-gray-200 bg-white" : "bg-gray-300 hover:bg-gray-100"}
                        `}
                    >
                        {/* Icon / Type */}
                        <div className="shrink-0">
                            <span
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-white bg-secondary-400`}
                            >
                                <HomeIcon className="h-5 w-5" />
                            </span>

                            {/* Unread indicator */}
                            {!n.isRead && (
                                <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-white" />
                            )}
                        </div>

                        {/* Notification content */}
                        <div className="flex-1 space-y-1">
                            {/* Title */}
                            <Typography as="h2" variant="body-sm-bold" className="text-gray-900">
                                {locale === "en" ? n.titleEn : n.titleAr}
                            </Typography>

                            {/* Body */}
                            <Typography as="p" variant="body-xs-medium" className="text-gray-600">
                                {locale === "en" ? n.bodyEn : n.bodyAr}
                            </Typography>

                            {/* Property info */}
                            {n.property && (
                                <Typography as="p" variant="body-xs-medium" className="text-gray-400">
                                    {t("property")}: {n.property.code} - {n.property.title}
                                </Typography>
                            )}
                        </div>
                    </div>
                ))}

            </div>

            <div className="flex justify-between items-center mt-6">
                <PaginationControls
                    currentPage={page}
                    totalPages={notificationsData?.pages || 1}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>
        </div>
    );
}
