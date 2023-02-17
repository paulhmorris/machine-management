import type { ComponentPropsWithRef, ReactNode } from "react";
import { forwardRef } from "react";
import { classNames } from "~/utils/utils";

interface ButtonProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", ...props }, ref) => {
    return (
      <button
        {...props}
        ref={ref}
        className={classNames(
          variant === "primary" &&
            "border-cyan-700 bg-cyan-700 text-white hover:border-cyan-800 hover:bg-cyan-800",
          variant === "secondary" &&
            "border-gray-300 bg-white hover:bg-gray-50",
          "inline-flex items-center justify-center space-x-2 rounded-md border px-4 py-2 text-base font-medium shadow-sm transition duration-75 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
          props.className
        )}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
