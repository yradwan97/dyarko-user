"use client"
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
import { useLocale } from "next-intl";

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
        <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}

// Helper to format reason strings
const formatReason = (reason: string) => {
    return reason.split("_").map(word => `${word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()}`).join(" ");
}

const formatDate = (dateString: string, locale: string) => {
        return new Date(dateString).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

function SkeletonCard() {
    return (
        <Card className="overflow-hidden rounded-2xl border-none shadow-xl">
            <Skeleton className="h-65 w-full" />
        </Card>
    );
}

/* ---------- page ---------- */

export default function PointsPage() {
    const totalPoints = 25000;
    const balance = 250.0;
    const locale = useLocale();

    const [page, setPage] = useState(1);

    const currency = useCurrency();

    const { data: transactionsData } = useGetPoints(page);

    const { data: userData, isLoading } = useGetUser();
    const userProfile: UserProfile | null = userData?.data || null;
    console.log("user data in rewards page:", userProfile);
    const transactions: Transaction[] = transactionsData?.data || [];

    return (
        <div className="container max-w-6xl py-8 px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-12 items-start">
                {/* ---------- TRANSACTIONS (LEFT) ---------- */}
                <div className="md:col-span-5">
                    <Suspense fallback={<SkeletonTransactions />}>
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="pb-6">
                                <CardTitle className="text-lg font-semibold">
                                    Your Transactions
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6 rounded-xl py-8">
                                {transactions.map((tx, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between border-b last:border-b-0 pb-4 border-b-main-400"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Star className="h-8 w-8 text-yellow-400 border rounded-full p-2 fill-yellow-400" />
                                            <div>
                                                <p className="text-sm font-medium text-main-500">
                                                    {formatReason(tx.reason)}
                                                </p>
                                                <p className="text-xs text-main-400">
                                                    {formatDate(tx.createdAt, locale)}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`text-sm font-semibold ${tx.points >= 0
                                                ? "text-main-500"
                                                : "text-secondary-400"
                                                }`}
                                        >
                                            {tx.points >= 0 ? "+" : ""}
                                            {tx.points}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </Suspense>
                </div>

                {/* ---------- POINTS CARD (RIGHT) ---------- */}
                <div className="md:col-span-7 mt-30">
                    <Suspense fallback={<SkeletonCard />}>
                        <Card className="overflow-hidden rounded-2xl py-0 border-none shadow-xl h-auto">
                            <div className="relative h-65 px-8">
                                {/* background */}
                                <Image
                                    src="/assets/wallet-placeholder.svg"
                                    alt="Points background"
                                    fill
                                    className="object-cover"
                                    priority
                                />

                                {/* content */}
                                <div className="relative z-10 py-2 h-full flex flex-col justify-between">
                                    {/* top row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col ">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center">
                                                    <Star className="h-4 w-4 text-slate-900 fill-slate-900" />
                                                </div>
                                                <span className="text-sm text-white">
                                                    your points
                                                </span>
                                            </div>
                                            <div className="text-5xl font-bold text-white tracking-tight">
                                                {userProfile?.points.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-left">
                                        <p className="text-lg text-white    ">
                                            Your Balance
                                        </p>
                                        <p className="text-lg font-semibold text-white">
                                            {balance.toFixed(2)} {currency}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </Card>
                    </Suspense>
                </div>
            </div>

            <PaginationControls
                currentPage={page}
                totalPages={transactionsData?.pages || 1}
                onPageChange={(page) => setPage(page)}
            />
        </div>
    );
}
