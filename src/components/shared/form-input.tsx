import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: { message?: string };
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error?.message && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
