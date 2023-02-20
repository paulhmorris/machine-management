type Props = {
  children: React.ReactNode;
};
export function TableWrapper({ children }: Props) {
  return (
    <div className="h-full pb-12">
      <div className="inline-block h-full min-w-full py-2 align-middle">
        <table className="w-full table-auto divide-y divide-gray-300 border-b border-gray-300">
          {children}
        </table>
        <p className="mt-8 text-center text-sm font-medium opacity-50">
          You've reached the end! 🎉
        </p>
      </div>
    </div>
  );
}
