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
            "border-cyan-700 bg-cyan-700 text-white focus:ring-cyan-600/50 hover:enabled:border-cyan-800 hover:enabled:bg-cyan-800",
          variant === "secondary" &&
            "border-gray-300 bg-white focus:ring-cyan-600/50 hover:enabled:bg-gray-50",
          variant === "danger" &&
            "border-red-600 bg-red-600 text-white focus:ring-red-700/50 hover:enabled:border-red-700 hover:enabled:bg-red-700",
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
