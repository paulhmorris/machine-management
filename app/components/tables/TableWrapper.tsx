type Props = {
  children: React.ReactNode;
};
export function TableWrapper({ children }: Props) {
  return (
    <div className="h-full">
      <div className="-my-2 -mx-4 h-full sm:-mx-6 lg:-mx-8">
        <div className="inline-block h-full min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-auto">
            <table className="w-full table-auto divide-y divide-gray-300 border-b border-gray-300">
              {children}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
