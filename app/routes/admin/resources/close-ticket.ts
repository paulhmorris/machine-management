import { Prisma } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireAdmin, requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { redirectWithToast } from "~/utils/toast.server";

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const userId = await requireUserId(request);
  const form = await request.formData();
  const ticketId = form.get("ticketId");
  const comments = form.get("comments");
  invariant(typeof ticketId === "string", "ticketId is required");
  invariant(typeof comments === "string", "Comments must be a string");

  try {
    await prisma.$transaction([
      prisma.ticket.update({
        where: { id: Number(ticketId) },
        data: { ticketStatusId: 4 },
      }),
      prisma.ticketEvent.create({
        data: {
          comments,
          createdByUserId: userId,
          assignedToUserId: userId,
          ticketId: Number(ticketId),
          ticketStatusId: 4,
        },
      }),
    ]);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(error.message);
    }
    return redirectWithToast(`/admin/tickets/${ticketId}`, session, {
      message: `Error closing ticket.`,
      type: "error",
    });
  }

  return redirectWithToast(`/admin/tickets/${ticketId}`, session, {
    message: "Ticket closed",
    type: "success",
  });
}
