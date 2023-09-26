import { Link } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import type { ReactNode } from "react";
import { forwardRef } from "react";
import { classNames } from "~/utils/utils";

interface Props extends RemixLinkProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export const ButtonLink = forwardRef<HTMLAnchorElement, Props>(
  ({ children, variant = "primary", disabled, ...props }, ref) => {
    return (
      <Link
        {...props}
        to={disabled ? "#" : props.to}
        ref={ref}
        className={classNames(
          variant === "primary" && "border-cyan-700 bg-cyan-700 text-white hover:border-cyan-800 hover:bg-cyan-800",
          variant === "secondary" && "border-gray-300 bg-white hover:bg-gray-50",
          "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-4 text-base font-medium shadow-sm transition duration-75 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 sm:py-2 sm:text-sm",
          disabled && "cursor-not-allowed opacity-50",
          props.className
        )}
      >
        {children}
      </Link>
    );
  }
);

ButtonLink.displayName = "Button";
