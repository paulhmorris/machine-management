import { Outlet } from "@remix-run/react";
import { AdminNav } from "~/components/layout/AdminNav";

export default function AdminLayout() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AdminNav />
      <div className="ml-64 mt-20 h-full px-6 pb-6">
        <div className="mx-auto h-full w-full max-w-screen-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
