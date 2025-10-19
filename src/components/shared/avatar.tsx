"use client"

import React from "react";
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Typography from "./typography";
import { Check } from "lucide-react";

type AvatarProps = {
  userName: string;
  link?: string;
  userImg?: string;
  className?: string;
  isVerified?: boolean;
};

const Avatar = ({
  userName,
  userImg,
  isVerified = false,
  className,
}: AvatarProps) => {
  const generateProfileImg = (name: string): string => {
    const names = name?.split(" ")?.slice(0, 2);
    return names?.reduce(
      (prev, curr) => prev.concat(curr[0].toUpperCase()),
      ""
    );
  };

  return (
    <div className="relative">
      <ShadcnAvatar className={`cursor-pointer ${className || "h-12 w-12"}`}>
        {userImg && (
          <AvatarImage
            src={userImg}
            alt={userName}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-main-500">
          <Typography variant="body-lg-bold" className="text-white" as="span">
            {generateProfileImg(userName)}
          </Typography>
        </AvatarFallback>
      </ShadcnAvatar>
      {isVerified && (
        <div className="absolute top-[70%] right-0 flex h-3 w-3 items-center justify-center rounded-full border border-white bg-green">
          <Check className="h-2 w-2 stroke-white" />
        </div>
      )}
    </div>
  );
};

export default Avatar;
