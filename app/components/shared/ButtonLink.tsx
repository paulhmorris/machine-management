import { Link } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import type { ReactNode } from "react";
import { classNames } from "~/utils/utils";

interface ButtonLinkProps extends RemixLinkProps {
  children: ReactNode;
}

export function ButtonLink({ children, ...props }: ButtonLinkProps) {
  return (
    <Link {...props} className={classNames("text-cyan-700", props.className)}>
      {children}
    </Link>
  );
}
