type Props = {
  children: React.ReactNode;
};

export function TableBody({ children }: Props) {
  return (
    <tbody className="divide-y divide-gray-200 overflow-y-scroll bg-white">
      {children}
    </tbody>
  );
}
