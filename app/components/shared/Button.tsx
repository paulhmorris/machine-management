import type { ComponentPropsWithRef, ReactNode } from "react";
import { forwardRef } from "react";
import { classNames } from "~/utils/utils";

interface ButtonProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", ...props }, ref) => {
    return (
      <button
        {...props}
        ref={ref}
        className={classNames(
          variant === "primary" &&
            "border-cyan-700 bg-cyan-700 text-white hover:border-cyan-800 hover:bg-cyan-800 focus:ring-cyan-600/50",
          variant === "secondary" &&
            "border-gray-300 bg-white hover:bg-gray-50 focus:ring-cyan-600/50",
          variant === "danger" &&
            "border-red-600 bg-red-600 text-white hover:border-red-700 hover:bg-red-700 focus:ring-red-700/50",
          "inline-flex items-center justify-center space-x-2 rounded-md border px-4 py-4 text-base font-medium shadow-sm transition duration-75 focus:outline-none focus:ring-2  focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2 sm:text-sm",
          props.className
        )}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
