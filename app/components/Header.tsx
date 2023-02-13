import { IconWashMachine } from "@tabler/icons-react";
import { useOptionalUser } from "~/utils";

export function Header() {
  const user = useOptionalUser();
  return (
    <header className="border-b border-gray-200 ">
      <div className="mx-auto flex items-center justify-between py-4 px-3">
        <div className="flex items-center">
          <IconWashMachine size={48} className="text-cyan-700" />
          <span className="text-sm font-bold text-cyan-700">
            Machine Manager
          </span>
        </div>
        {user && (
          <div>
            <span>{user.email}</span>
          </div>
        )}
      </div>
    </header>
  );
}
