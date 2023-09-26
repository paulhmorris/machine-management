import type { ReactNode } from "react";
import { ButtonLink } from "~/components/shared/ButtonLink";

type Props = {
  title: string;
  noAction?: boolean;
  href?: string;
  actionText?: string;
  actionIcon?: ReactNode;
  description?: string;
};

export function PageHeader({ title, href, actionText, actionIcon, description, noAction = false }: Props) {
  return (
    <div className="mb-4 border-b border-gray-100 pb-4 sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <h1>{title}</h1>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {noAction ? null : (
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <ButtonLink to={href ?? "#"}>
            <span>{actionText}</span>
            {actionIcon}
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
