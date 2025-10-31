"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight } from "lucide-react";

import Typography from "@/components/shared/typography";
import { useGetWalletData } from "@/hooks/use-user";
import { Spinner } from "@/components/ui/spinner";
import PaginationControls from "@/components/shared/pagination-controls";

export default function WalletPage() {
  const t = useTranslations("User.Wallet");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetWalletData(page);

  const walletData = data?.data;
  const balance = walletData?.balance || 0;
  const transactions = walletData?.transactions || [];
  const totalPages = walletData?.pages || 1;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KWD",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Typography variant="h3" as="h3" className="font-bold">
          {t("title")}
        </Typography>
        <Typography variant="body-md" as="p" className="text-gray-500">
          {t("description")}
        </Typography>
      </div>

      {/* Balance Card */}
      <div className="rounded-lg border-2 border-main-400 bg-gradient-to-br from-main-50 to-main-100 p-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <WalletIcon className="h-8 w-8 text-main-600" />
          <Typography variant="body-lg" as="p" className="text-gray-600">
            {t("balance")}
          </Typography>
        </div>
        <Typography variant="h2" as="p" className="text-center font-bold text-main-600">
          {formatCurrency(balance)}
        </Typography>
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        <Typography variant="h4" as="h4" className="font-bold">
          {t("recent-transactions")}
        </Typography>

        {transactions.length === 0 ? (
          <div className="py-12 text-center">
            <WalletIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <Typography variant="body-lg" as="p" className="text-gray-500">
              {t("no-transactions")}
            </Typography>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        transaction.type === "credit" || transaction.type === "deposit"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {transaction.type === "credit" || transaction.type === "deposit" ? (
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <div>
                      <Typography variant="body-md" as="p" className="font-medium">
                        {transaction.description}
                      </Typography>
                      <Typography variant="body-sm" as="p" className="text-gray-500">
                        {formatDate(transaction.paid_at || transaction.createdAt)}
                      </Typography>
                    </div>
                  </div>

                  <div className="text-right">
                    <Typography
                      variant="body-lg"
                      as="p"
                      className={`font-bold ${
                        transaction.type === "credit" || transaction.type === "deposit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "credit" || transaction.type === "deposit" ? "+" : "-"}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </Typography>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-4">
                <PaginationControls
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
