export { TableBody } from "./TableBody";
export { TableCell } from "./TableCell";
export { TableHead } from "./TableHead";
export { TableHeader } from "./TableHeader";
export { TableWrapper } from "./TableWrapper";

export type TableColumn<T extends any[] = []> = {
  key: T extends any[] ? keyof T[number] : string;
  title: string;
  sortable: boolean;
};

export type SortConfig<T extends any[] = []> = {
  key: keyof T[number];
  direction: "asc" | "desc";
};
