import { classNames } from "~/utils/utils";

type Props = {
  children: React.ReactNode;
  allowWrap?: boolean;
};
export function TableCell({ children, allowWrap = false }: Props) {
  return (
    <td
      className={classNames(
        "px-4 py-2.5 text-sm",
        allowWrap ? "break-words" : "whitespace-nowrap"
      )}
    >
      {children}
    </td>
  );
}
