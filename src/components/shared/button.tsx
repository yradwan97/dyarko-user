import type {
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type ButtonVariants = "primary" | "primary-outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariants;
  linkOnClick?: MouseEventHandler<HTMLAnchorElement>;
  selected?: boolean;
  to?: string;
  location?: string;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
}

const Button = (props: ButtonProps) => {
  const { variant = "primary", linkOnClick, location, to, className, children, disabled } = props;

  const baseStyle = "inline-flex items-center justify-center px-2 py-2 font-bold tracking-tight rounded-lg transition-all duration-300 border-2 md:px-5";

  const variantClasses = {
    primary: cn(
      baseStyle,
      "bg-main-600 text-white border-main-600",
      !disabled && "hover:border-main-600 hover:bg-main-500 hover:text-white",
      disabled && "opacity-50 cursor-not-allowed"
    ),
    "primary-outline": cn(
      baseStyle,
      "border-main-600 bg-white text-main-600",
      !disabled && "hover:bg-main-600 hover:border-main-600 hover:text-white",
      disabled && "opacity-50 cursor-not-allowed"
    ),
  };

  const btnClasses = cn(
    "no-underline text-base",
    variantClasses[variant],
    className
  );

  if (to) {
    return (
      <Link
        onClick={linkOnClick}
        href={to}
        className={btnClasses}
        legacyBehavior={location === "payment"}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type || "button"}
      className={btnClasses}
      onClick={props.onClick}
      value={props.value}
      disabled={disabled}
    >
      {props.children}
    </button>
  );
};

export default Button;
