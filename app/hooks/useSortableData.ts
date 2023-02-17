import { useMemo, useState } from "react";
import type { SortConfig } from "~/components/tables";

export function useSortableData<T extends any[]>(
  items: T,
  config: SortConfig<T>
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(config);

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [items, sortConfig]);

  function requestSort(key: string) {
    let direction: SortConfig<T>["direction"] = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  }

  return { items: sortedItems, requestSort, sortConfig };
}
