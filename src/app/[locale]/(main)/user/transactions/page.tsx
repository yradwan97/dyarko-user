"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Receipt, ArrowDownLeft, ArrowUpRight, Calendar, FileText } from "lucide-react";

import Typography from "@/components/shared/typography";
import { useGetTransactions } from "@/hooks/use-user";
import { Spinner } from "@/components/ui/spinner";

export default function TransactionsPage() {
  const t = useTranslations("User.Transactions");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetTransactions(page);

  const transactions = data?.data?.wallet || [];

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
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "failed":
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType === "credit" || lowerType === "deposit") {
      return "text-green-600 bg-green-100";
    }
    return "text-red-600 bg-red-100";
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

      {transactions.length === 0 ? (
        <div className="py-12 text-center">
          <Receipt className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <Typography variant="body-lg" as="p" className="text-gray-500 mb-2">
            {t("no-transactions")}
          </Typography>
          <Typography variant="body-sm" as="p" className="text-gray-400">
            {t("no-transactions-description")}
          </Typography>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <Typography variant="body-sm" as="span" className="font-bold text-gray-700">
                      {t("transaction-id")}
                    </Typography>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Typography variant="body-sm" as="span" className="font-bold text-gray-700">
                      {t("description")}
                    </Typography>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Typography variant="body-sm" as="span" className="font-bold text-gray-700">
                      {t("type")}
                    </Typography>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Typography variant="body-sm" as="span" className="font-bold text-gray-700">
                      {t("amount")}
                    </Typography>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Typography variant="body-sm" as="span" className="font-bold text-gray-700">
                      {t("status")}
                    </Typography>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <Typography variant="body-sm" as="span" className="font-bold text-gray-700">
                      {t("date")}
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Typography variant="body-sm" as="span" className="font-mono text-gray-600">
                        {transaction._id.slice(-8).toUpperCase()}
                      </Typography>
                    </td>
                    <td className="px-6 py-4">
                      <Typography variant="body-sm" as="span" className="text-gray-900">
                        {transaction.description}
                      </Typography>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${getTypeColor(
                          transaction.type
                        )}`}
                      >
                        {transaction.type === "credit" || transaction.type === "deposit" ? (
                          <ArrowDownLeft className="h-3 w-3" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" />
                        )}
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Typography
                        variant="body-md"
                        as="span"
                        className={`font-bold ${
                          transaction.type === "credit" || transaction.type === "deposit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "credit" || transaction.type === "deposit" ? "+" : "-"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </Typography>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Typography variant="body-sm" as="span" className="text-gray-600">
                        {formatDate(transaction.paid_at || transaction.createdAt)}
                      </Typography>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
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
                      <Typography variant="body-md" as="p" className="font-medium mb-1">
                        {transaction.description}
                      </Typography>
                      <Typography variant="body-xs" as="p" className="text-gray-500 font-mono">
                        #{transaction._id.slice(-8).toUpperCase()}
                      </Typography>
                    </div>
                  </div>
                  <Typography
                    variant="body-md"
                    as="span"
                    className={`font-bold ${
                      transaction.type === "credit" || transaction.type === "deposit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" || transaction.type === "deposit" ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </Typography>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <Typography variant="body-sm" as="span">
                      {formatDate(transaction.paid_at || transaction.createdAt)}
                    </Typography>
                  </div>
                  <span
                    className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
