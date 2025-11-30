"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  cancelText: string;
  confirmText: string;
  onConfirm: () => void;
  isLoading?: boolean;
  loadingText?: string;
  variant?: "default" | "destructive";
  children?: React.ReactNode;
  confirmButtonClassName?: string;
  titleClassName?: string;
  disabled?: boolean;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText,
  confirmText,
  onConfirm,
  isLoading = false,
  loadingText,
  variant = "default",
  children,
  confirmButtonClassName,
  titleClassName,
  disabled = false,
}: ConfirmationDialogProps) {
  const getConfirmButtonClass = () => {
    if (confirmButtonClassName) return confirmButtonClassName;

    if (variant === "destructive") {
      return "bg-red-600 hover:bg-red-700 text-white";
    }
    return "bg-main-600 hover:bg-main-700 text-white";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-gray-950">
        <AlertDialogHeader>
          <AlertDialogTitle className={cn("text-gray-900 dark:text-white", titleClassName)}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading || disabled}
            className="text-gray-900 dark:text-white"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading || disabled}
            className={getConfirmButtonClass()}
          >
            {isLoading ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                {loadingText || confirmText}
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
