import { Outlet } from "@remix-run/react";
import { AdminNav } from "~/components/AdminNav";

// export async function loader({ request }: LoaderArgs) {
//   const user = await getUser(request);
// }

export default function AdminLayout() {
  return (
    <div className="flex h-full">
      <AdminNav />
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
}
