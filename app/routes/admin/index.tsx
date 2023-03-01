import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "react-router";
import { requireAdmin } from "~/utils/auth.server";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  return redirect("/admin/tickets");
}
