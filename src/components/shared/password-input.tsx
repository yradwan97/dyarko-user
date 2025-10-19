"use client";

import type { InputHTMLAttributes } from "react";
import { forwardRef, useState } from "react";

import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: { message?: string };
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
          </Label>
        )}
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn(
              "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        {error?.message && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
