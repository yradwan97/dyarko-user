"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import PaginationControls from "@/components/shared/pagination-controls";
import { useGetPoints, useGetUser, UserProfile } from "@/hooks/use-user";
import { useLocale, useTranslations } from "next-intl";

/* ---------- types ---------- */

type Transaction = {
    _id: string;
    points: number;
    reason: string;
    createdAt: string;
};

/* ---------- skeletons ---------- */

function SkeletonTransactions() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}

function SkeletonCard() {
    return (
        <Card className="w-full overflow-hidden rounded-2xl border-none shadow-lg">
            <Skeleton className="h-55 w-full" />
        </Card>
    );
}

/* ---------- helpers ---------- */

const formatReason = (reason: string) =>
    reason
        .split("_")
        .map(
            (word) =>
                `${word.charAt(0).toUpperCase()}${word
                    .slice(1)
                    .toLowerCase()}`
        )
        .join(" ");

const formatDate = (dateString: string, locale: string) =>
    new Date(dateString).toLocaleDateString(
        locale === "ar" ? "ar-EG" : "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );

/* ---------- page ---------- */

export default function PointsPage() {
    const locale = useLocale();
    const currency = useCurrency();
    const t = useTranslations("User.Rewards.Page");

    const [page, setPage] = useState(1);

    const { data: transactionsData } = useGetPoints(page);
    const { data: userData } = useGetUser();

    const userProfile: UserProfile | null = userData?.data || null;
    const transactions: Transaction[] = transactionsData?.data || [];

    return (
        <div className="container max-w-6xl px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <div className="grid gap-6 md:gap-8 lg:gap-10 md:grid-cols-12 items-start">
                {/* ---------- TRANSACTIONS ---------- */}
                <div className="md:col-span-6 lg:col-span-5 min-w-0 order-2 md:order-1">
                    <Suspense fallback={<SkeletonTransactions />}>
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="pb-3 md:pb-6 px-0">
                                <CardTitle className="text-base md:text-lg font-semibold">
                                    {t("transactionsTitle")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-5 py-4 md:py-6">
                                {transactions.length === 0 && (
                                    <p className="text-sm text-main-400">
                                        {t("noTransactions")}
                                    </p>
                                )}
                                {transactions.map((tx) => (
                                    <div
                                        key={tx._id}
                                        className="flex items-start justify-between gap-3 py-3 border-b border-b-main-400 last:border-none hover:bg-muted/30 transition rounded-lg px-2"
                                    >
                                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                                            <Star
                                                className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400 border rounded-full p-1.5 sm:p-2 fill-yellow-400 shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-main-500 leading-tight truncate">
                                                    {formatReason(tx.reason)}
                                                </p>
                                                <p className="text-xs text-main-400">
                                                    {formatDate(tx.createdAt, locale)}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-sm font-semibold whitespace-nowrap ${tx.points >= 0
                                                ? "text-main-500"
                                                : "text-secondary-400"
                                                }`}
                                        >
                                            {tx.points >= 0 ? "+" : ""}
                                            {t("points", { count: tx.points })}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </Suspense>
                </div>

                {/* ---------- POINTS CARD ---------- */}
                <div className="md:col-span-6 lg:col-span-7 min-w-0 order-1 md:order-2 md:sticky md:top-24">
                    <Suspense fallback={<SkeletonCard />}>
                        <Card className="w-full overflow-hidden rounded-2xl border-none shadow-lg md:shadow-xl">
                            <div className="relative min-h-50 sm:min-h-65 md:min-h-75 px-6 sm:px-8 pt-6 pb-5 overflow-hidden">
                                <Image
                                    src="/assets/wallet-placeholder.svg"
                                    alt={t("pointsBackgroundAlt")}
                                    fill
                                    className="object-cover object-right"
                                    priority
                                />
                                <div className="absolute inset-0 bg-linear-to-b from-[#0f2746]/60 to-[#0f2746]/20" />
                                {/* text on card starts here */}
                                <div className="relative z-10 h-80 justify-between flex-col flex">
                                    <div className="flex items-center gap-2">
                                        <div className="h-12 w-12 rounded-full bg-yellow-400 flex items-center justify-center">
                                            <Star className="h-6 w-6 text-slate-900 fill-slate-900" />
                                        </div>
                                        <div className="flex flex-col ">
                                            <p className="text-lg text-white/80 mb-1">
                                                {t("yourPoints")}
                                            </p>
                                            <h2 className="text-3xl sm:text-4xl font-bold text-white">
                                                {userProfile?.points || 0}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 rtl:self-end">
                                        <p className="text-2xl text-white">
                                            {t("yourBalance")}
                                        </p>
                                        <p className="text-2xl font-semibold text-white">
                                            {Intl.NumberFormat(locale, {minimumFractionDigits: 2}).format(userProfile?.PointsPerCurrency ?? 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Suspense>
                </div>
            </div>
            <div className="mt-6 md:mt-8">
                <PaginationControls
                    currentPage={page}
                    totalPages={transactionsData?.pages || 1}
                    onPageChange={(p) => setPage(p)}
                />
            </div>
        </div>
    );
}