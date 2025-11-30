"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { SendIcon, TrashIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmationDialog from "@/components/dialogs/confirmation-dialog";
import {
  useVideoComments,
  useAddVideoComment,
  useDeleteVideoComment,
} from "@/hooks/use-videos";
import { cn, getLocalizedPath } from "@/lib/utils";
import { toast } from "sonner";
import type { Comment } from "@/lib/services/api/reels";

interface VideoCommentsSectionProps {
  videoId: string;
}

export default function VideoCommentsSection({
  videoId,
}: VideoCommentsSectionProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("VideoCommentsSection");
  const { data: session } = useSession();

  const [commentText, setCommentText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const { data, isLoading, isError } = useVideoComments(videoId, {
    page: currentPage,
    size: 10,
  });

  const addCommentMutation = useAddVideoComment(videoId);
  const deleteCommentMutation = useDeleteVideoComment(videoId);

  const comments = data?.data?.data || [];
  const totalPages = data?.data?.totalPages || 1;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.error(t("emptyComment"));
      return;
    }

    addCommentMutation.mutate(commentText, {
      onSuccess: () => {
        setCommentText("");
        toast.success(t("commentAdded"));
      },
      onError: () => {
        toast.error(t("commentError"));
      },
    });
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate(commentToDelete, {
        onSuccess: () => {
          toast.success(t("commentDeleted"));
          setCommentToDelete(null);
        },
        onError: () => {
          toast.error(t("deleteError"));
          setCommentToDelete(null);
        },
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPp");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mt-8">
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
        {t("title")}
      </h2>

      {/* Add Comment Form */}
      {session ? (
        <form
          onSubmit={handleSubmitComment}
          className="mb-8 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div
            className={cn(
              "flex gap-4",
              isRTL && "flex-row-reverse"
            )}
          >
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={session.user?.image || undefined} />
              <AvatarFallback>
                {(session.user?.name?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t("placeholder")}
                className="mb-3 min-h-[80px] resize-none"
                disabled={addCommentMutation.isPending}
              />
              <div className={cn("flex justify-end", isRTL && "flex-row-reverse")}>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  className={cn("gap-2", isRTL && "flex-row-reverse")}
                >
                  <SendIcon className="h-4 w-4" />
                  {addCommentMutation.isPending ? t("posting") : t("postComment")}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("loginToComment")}{" "}
            <a
              href={getLocalizedPath("/login", locale)}
              className="text-main-500 hover:underline dark:text-main-400"
            >
              {t("login")}
            </a>
          </p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("loadError")}
          </p>
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("noComments")}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((comment: Comment) => (
              <div
                key={comment._id}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div
                  className={cn(
                    "flex gap-4",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage
                      src={
                        comment.user?.profilePicture ||
                        comment.user?.image ||
                        undefined
                      }
                    />
                    <AvatarFallback>
                      {(
                        comment.user?.username?.[0] ||
                        comment.user?.name?.[0] ||
                        "U"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div
                      className={cn(
                        "mb-1 flex items-center justify-between",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {comment.user?.username ||
                            comment.user?.name ||
                            t("anonymous")}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      {session?.user?.id === comment.user?._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment._id)}
                          disabled={deleteCommentMutation.isPending}
                          className="text-red-500 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t("previous")}
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t("next")}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Comment Confirmation Dialog */}
      <ConfirmationDialog
        open={!!commentToDelete}
        onOpenChange={() => setCommentToDelete(null)}
        title={t("deleteConfirmation.title")}
        description={t("deleteConfirmation.description")}
        cancelText={t("deleteConfirmation.cancel")}
        confirmText={t("deleteConfirmation.confirm")}
        onConfirm={confirmDeleteComment}
        variant="destructive"
        isLoading={deleteCommentMutation.isPending}
      />
    </div>
  );
}
