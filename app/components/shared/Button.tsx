import type { ComponentPropsWithRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "~/utils/utils";

interface ButtonProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, variant = "primary", ...props }, ref) => {
  return (
    <button
      {...props}
      ref={ref}
      className={cn(
        variant === "primary" &&
          "border-cyan-700 bg-cyan-700 text-white shadow-sm focus:ring-cyan-600/50 hover:enabled:border-cyan-800 hover:enabled:bg-cyan-800",
        variant === "secondary" && "border-gray-300 bg-white shadow-sm focus:ring-cyan-600/50 hover:enabled:bg-gray-50",
        variant === "ghost" &&
          "border-transparent bg-transparent text-cyan-700 focus:ring-cyan-600/50 hover:enabled:bg-gray-100",
        variant === "danger" &&
          "border-red-600 bg-red-600 text-white shadow-sm focus:ring-red-700/50 hover:enabled:border-red-700 hover:enabled:bg-red-700",
        "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-4 text-base font-medium transition duration-75 focus:outline-none focus:ring-2  focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2 sm:text-sm",
        props.className
      )}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
