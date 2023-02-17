import { Outlet } from "@remix-run/react";

export default function ReportLayout() {
  return (
    <main className="h-full min-h-screen py-6 px-2 md:mx-auto md:max-w-sm md:px-0">
      <Outlet />
    </main>
  );
}
