import { cn } from "~/utils/utils";

type Props = {
  children: React.ReactNode;
  allowWrap?: boolean;
};
export function TableCell({ children, allowWrap = false }: Props) {
  return <td className={cn("max-w-sm px-4 py-2.5 text-sm", allowWrap ? "break-words" : "truncate")}>{children}</td>;
}
