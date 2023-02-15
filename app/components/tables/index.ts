export { TableBody } from "./TableBody";
export { TableCell } from "./TableCell";
export { TableHead } from "./TableHead";
export { TableHeader } from "./TableHeader";
export { TableWrapper } from "./TableWrapper";

export type TableColumn = {
  title: string;
  key: string;
  sortable: boolean;
};

export type SortConfig<T extends any[] = []> = {
  key: keyof T[number];
  direction: "asc" | "desc";
};
