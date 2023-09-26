import { Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { CaughtError } from "~/components/shared/CaughtError";
import { requireCA } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireCA(request);
  return null;
}

export default function TechLayout() {
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
