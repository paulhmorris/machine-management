import { Outlet } from "@remix-run/react";

export default function ReportLayout() {
  return (
    <div>
      <h1>Report Layout</h1>
      <Outlet />
    </div>
  );
}
