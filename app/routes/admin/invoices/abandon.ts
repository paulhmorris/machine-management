import type { ActionArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { redirectWithToast } from "~/utils/toast.server";

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = await request.formData();
  const invoiceId = form.get("invoiceId");
  invariant(typeof invoiceId === "string", "Expected invoiceId");

  await prisma.charge.deleteMany({
    where: { invoiceId },
  });
  await prisma.invoice.delete({
    where: { id: invoiceId },
  });
  return redirectWithToast("/admin/invoices", session, {
    message: "Invoice abandoned",
    type: "success",
  });
}
