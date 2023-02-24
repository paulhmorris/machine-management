import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { toast } from "react-hot-toast";
import { Button } from "~/components/shared/Button";
import { requireVendorOrAdmin } from "~/utils/auth.server";

export async function loader({ request }: LoaderArgs) {
  await requireVendorOrAdmin(request);
  return json({});
}

export default function AdminIndex() {
  return (
    <main>
      <h1>Admin Index</h1>
      <Button onClick={() => toast.success("Heyo!")}>Toast</Button>
    </main>
  );
}
