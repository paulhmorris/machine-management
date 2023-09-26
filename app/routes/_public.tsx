import { Outlet } from "@remix-run/react";
import { CaughtError } from "~/components/shared/CaughtError";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-lg flex-col px-4 pt-24 sm:px-0">
        <Outlet />
      </main>
    </div>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}
