import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { AdminNav } from "~/components/layout/AdminNav";
import { CaughtError } from "~/components/shared/CaughtError";
import { UncaughtError } from "~/components/shared/UncaughtError";

export const meta: MetaFunction = () => {
  return {
    title: "Admin | Machine Management",
  };
};

export default function AdminLayout() {
  return (
    <div className="flex h-full flex-col">
      <AdminNav />
      <div className="ml-64 mt-20 h-full px-6 pb-6">
        <div className="mx-auto h-full w-full max-w-screen-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
