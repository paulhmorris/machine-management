type Props = {
  children: React.ReactNode;
};
export function TableCell({ children }: Props) {
  return <td className="whitespace-nowrap px-4 py-2.5 text-sm">{children}</td>;
}
