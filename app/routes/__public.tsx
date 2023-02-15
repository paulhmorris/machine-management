import { Outlet } from "@remix-run/react";
import { PublicHeader } from "~/components/layout/PublicHeader";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-lg flex-col px-4 pt-24 sm:px-0">
        <Outlet />
      </main>
    </div>
  );
}
