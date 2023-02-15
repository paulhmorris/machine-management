import { Link } from "@remix-run/react";

type Props = {
  title: string;
  noAction?: boolean;
  href?: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
  description?: string;
};

export function TableHeader({
  title,
  href,
  actionText,
  actionIcon,
  description,
  noAction = false,
}: Props) {
  return (
    <div className="sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <h1>{title}</h1>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {noAction ? null : (
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to={href ?? "#"}
            className="inline-flex items-center justify-center space-x-2 rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:w-auto"
          >
            <span>{actionText}</span>
            {actionIcon}
          </Link>
        </div>
      )}
    </div>
  );
}
