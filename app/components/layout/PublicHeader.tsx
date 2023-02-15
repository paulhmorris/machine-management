import { Link } from "@remix-run/react";
import { IconWashMachine } from "@tabler/icons-react";

export function PublicHeader() {
  return (
    <header className="w-full border-b border-gray-200 py-4 px-3">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between">
        <div>
          <Link to="/" className="flex items-center">
            <IconWashMachine size={48} className="text-cyan-700" />
            <span className="text-sm font-bold text-cyan-700">
              Machine Manager
            </span>
          </Link>
        </div>
        <div className="flex space-x-3">
          <Link to="/admin">Admin</Link>
          <Link to="/login">Login</Link>
          <form action="/logout" method="post">
            <button type="submit">Logout</button>
          </form>
        </div>
      </div>
    </header>
  );
}
