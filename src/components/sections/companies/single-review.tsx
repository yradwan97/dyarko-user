import Image from "next/image";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { Review } from "@/lib/services/api/companies";
import Typography from "@/components/shared/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SingleReviewProps {
  review: Review;
}

export default function SingleReview({ review }: SingleReviewProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-main-300 bg-main-100">
      <CardContent className="p-7">
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
            {review.comment}
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
      </CardContent>
    </Card>
  );
}
