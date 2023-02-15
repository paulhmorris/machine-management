import { Link } from "@remix-run/react";

type Props = {
  page: number;
  perPage: number;
  total: number;
};

export function Pagination({ page, perPage, total }: Props) {
  const disablePrev = page === 0;
  const disableNext = page * perPage >= total;
  return (
    <nav className="flex items-center justify-between" aria-label="Pagination">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">{page === 0 ? 1 : page * perPage}</span>{" "}
          to <span className="font-medium">{(page + 1) * perPage}</span> of{" "}
          <span className="font-medium">{total}</span> results
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <Link
          to={disablePrev ? "#" : `?page=${page - 1}`}
          role="button"
          aria-disabled={page === 0}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
          Previous
        </Link>
        <Link
          to={disableNext ? "#" : `?page=${page + 1}`}
          role="button"
          aria-disabled={page * perPage >= total}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </Link>
      </div>
    </nav>
  );
}
