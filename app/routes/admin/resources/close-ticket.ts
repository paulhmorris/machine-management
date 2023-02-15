import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireAdmin, requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const userId = await requireUserId(request);
  const form = await request.formData();
  const ticketId = form.get("ticketId");
  const comments = form.get("comments");
  invariant(typeof ticketId === "string", "ticketId is required");
  invariant(typeof comments === "string", "Comments must be a string");

  await prisma.ticket.update({
    where: { id: Number(ticketId) },
    data: { ticketStatusId: 4 },
  });

  await prisma.ticketEvent.create({
    data: {
      comments,
      createdByUserId: userId,
      assignedToUserId: userId,
      ticketId: Number(ticketId),
      ticketStatusId: 4,
    },
  });

  return redirect("/admin/tickets");
}
