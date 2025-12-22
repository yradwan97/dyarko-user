"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { Review } from "@/lib/services/api/companies";
import Typography from "@/components/shared/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SingleReviewProps {
  review: Review;
}

const MAX_COMMENT_LENGTH = 100;

export default function SingleReview({ review }: SingleReviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const truncatedComment =
    review.comment.length > MAX_COMMENT_LENGTH
      ? `${review.comment.slice(0, MAX_COMMENT_LENGTH)}...`
      : review.comment;

  const shouldShowMore = review.comment.length > MAX_COMMENT_LENGTH;

  const ReviewContent = ({ isTruncated = false }: { isTruncated?: boolean }) => (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={review.user.image || undefined} alt={review.user.name} />
          <AvatarFallback className="bg-main-400 text-white">
            {getInitials(review.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-2 md:space-y-3">
          <Typography variant="body-lg-bold" as="h4">
            {review.user.name}
          </Typography>
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-5 w-5 ${
                  index < review.rate
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      <Typography
        variant="body-md-medium"
        as="p"
        className="text-gray-600 md:w-10/12 md:text-gray-800"
      >
        {isTruncated ? truncatedComment : review.comment}
      </Typography>
      {review.createdAt && (
        <Typography
          variant="body-sm-medium"
          as="span"
          className="block text-gray-500"
        >
          {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm")}
        </Typography>
      )}
    </div>
  );

  return (
    <>
      <Card
        className="cursor-pointer border-main-300 bg-main-100 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
        onClick={() => setIsModalOpen(true)}
      >
        <CardContent className="p-7">
          <ReviewContent isTruncated />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-main-300 bg-main-100 sm:max-w-lg">
          <VisuallyHidden>
            <DialogTitle>Review by {review.user.name}</DialogTitle>
          </VisuallyHidden>
          <ReviewContent isTruncated={false} />
        </DialogContent>
      </Dialog>
    </>
  );
}
