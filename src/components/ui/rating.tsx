import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showValue?: boolean;
}

export function Rating({
  value,
  max = 5,
  size = "md",
  className,
  showValue = false
}: RatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const stars = Array.from({ length: max }, (_, index) => {
    const starValue = index + 1;
    const isFull = starValue <= Math.floor(value);
    const isHalf = starValue === Math.ceil(value) && value % 1 !== 0;

    return (
      <div key={index} className="relative">
        {isHalf ? (
          <div className="relative">
            <Star className={cn(sizeClasses[size], "text-gray-300")} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${(value % 1) * 100}%` }}>
              <Star className={cn(sizeClasses[size], "fill-main-500 text-main-500")} />
            </div>
          </div>
        ) : (
          <Star
            className={cn(
              sizeClasses[size],
              isFull ? "fill-main-500 text-main-500" : "text-gray-300"
            )}
          />
        )}
      </div>
    );
  });

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
