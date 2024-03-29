import { IconArrowsSort, IconSortAscendingLetters, IconSortDescendingLetters } from "@tabler/icons-react";
import type { SortConfig, TableColumn } from "~/components/tables";
import { cn } from "~/utils/utils";

type HeadProps = {
  columns: TableColumn[];
  sortConfig: SortConfig;
  includeActionCol?: boolean;
  sortFn?: (key: string | number | symbol) => void;
};

export function TableHead({ columns, sortFn, sortConfig, includeActionCol }: HeadProps) {
  return (
    <thead className="whitespace-nowrap border-t border-gray-200 bg-gray-50">
      <tr>
        {columns.map(({ title, key, sortable }) => {
          const sortedIcon =
            sortConfig.direction === "asc" ? (
              <IconSortAscendingLetters size={18} />
            ) : (
              <IconSortDescendingLetters size={18} />
            );
          const isSortedField = key === sortConfig.key;
          return (
            <th
              key={`th-${title}`}
              scope="col"
              className="group border-b border-gray-300 py-3.5 pl-4 pr-1 text-left text-sm font-semibold text-gray-900"
            >
              <div className="flex items-center gap-2">
                <span>{title}</span>
                {sortFn && sortable && (
                  <button
                    type="button"
                    className={cn(
                      "rounded-md bg-gray-200 p-0.5 transition duration-75 group-hover:opacity-100",
                      isSortedField ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => sortFn(key)}
                  >
                    {isSortedField ? <span>{sortedIcon}</span> : <IconArrowsSort size={18} />}
                  </button>
                )}
              </div>
            </th>
          );
        })}
        {includeActionCol && <th scope="col" className="border-b border-gray-300 bg-opacity-75 py-3.5 pl-4 pr-1"></th>}
      </tr>
    </thead>
  );
}
