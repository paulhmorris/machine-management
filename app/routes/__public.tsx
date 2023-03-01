import { Outlet, useCatch } from "@remix-run/react";
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

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <div>
      <h1>Caught</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  );
}
