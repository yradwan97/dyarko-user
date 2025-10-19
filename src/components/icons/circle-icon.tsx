import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CircleIconProps {
  icon: ReactNode;
  subIcon?: ReactNode;
  serviceIcon?: ReactNode;
  className?: string;
}

export function CircleIcon({
  icon,
  subIcon,
  serviceIcon,
  className,
}: CircleIconProps) {
  return (
    <div
      className={cn(
        "h-16 w-16 rounded-full border border-main-yellow-400 bg-white p-1",
        className
      )}
    >
      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-main-yellow-400">
        {icon}
        {subIcon && (
          <div className="absolute -right-1 top-9 flex h-6 w-6 items-center justify-center rounded-lg bg-main-400">
            {subIcon}
          </div>
        )}
        {serviceIcon && !subIcon && (
          <div className="absolute -right-1 top-9 flex h-6 w-6 items-center justify-center">
            {serviceIcon}
          </div>
        )}
      </div>
    </div>
  );
}
