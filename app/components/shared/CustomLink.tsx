import { Link } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import type { ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "~/utils/utils";

interface Props extends RemixLinkProps {
  children: ReactNode;
}

export const CustomLink = forwardRef<typeof Link, Props>(({ children, ...props }, ref) => {
  return (
    <Link
      {...props}
      className={cn(
        "-m-1 p-1 font-medium text-cyan-700 decoration-cyan-800 decoration-2 underline-offset-2 transition duration-75 hover:text-cyan-800 hover:underline",
        props.className
      )}
    >
      {children}
    </Link>
  );
});

CustomLink.displayName = "CustomLink";
