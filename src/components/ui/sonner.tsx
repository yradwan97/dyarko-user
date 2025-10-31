"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-500",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "group-[.toast]:bg-red-600 group-[.toast]:text-white group-[.toast]:border-red-600",
          success: "group-[.toast]:bg-green-600 group-[.toast]:text-white group-[.toast]:border-green-600",
          warning: "group-[.toast]:bg-yellow-600 group-[.toast]:text-white group-[.toast]:border-yellow-600",
          info: "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:border-blue-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
