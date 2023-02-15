import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireVendorOrAdmin } from "~/utils/auth.server";

export async function loader({ request }: LoaderArgs) {
  await requireVendorOrAdmin(request);
  return json({});
}

export default function AdminIndex() {
  return (
    <main>
      <h1>Admin Index</h1>
    </main>
  );
}
