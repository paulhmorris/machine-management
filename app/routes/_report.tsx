import { Outlet } from "@remix-run/react";
import { CaughtError } from "~/components/shared/CaughtError";
import { UncaughtError } from "~/components/shared/UncaughtError";

export default function ReportLayout() {
  return (
    <main className="h-full min-h-screen py-6 px-2 md:mx-auto md:max-w-sm md:px-0">
      <Outlet />
    </main>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
