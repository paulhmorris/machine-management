import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  IconLock,
  IconLockOpen,
  IconNotes,
  IconUserPlus,
} from "@tabler/icons-react";
import invariant from "tiny-invariant";
import { Button } from "~/components/shared/Button";
import { ButtonLink } from "~/components/shared/ButtonLink";
import {
  AddNoteForm,
  AttendantForm,
  CampusTechForm,
  CloseForm,
  MachineTechForm,
  ReopenForm,
} from "~/components/tickets/ActionForms";
import { getCampusUsers } from "~/models/campusUser.server";
import {
  getTicketWithCampusId,
  reassignTicket,
  updateTicketStatus,
} from "~/models/ticket.server";
import { ticketAssignmentSchema } from "~/schemas/ticket";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { redirectWithToast } from "~/utils/toast.server";
import { badRequest } from "~/utils/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  invariant(ticketId, "Ticket ID is required");

  const ticket = await getTicketWithCampusId(Number(ticketId));
  if (!ticket) {
    throw badRequest(`Ticket with id ${ticketId} not found`);
  }
  const campusUsers = await getCampusUsers(
    ticket.machine.pocket.location.campus.id
  );
  return json({ ticket, campusUsers });
}

export async function action({ request, params }: ActionArgs) {
  const user = await requireAdmin(request);
  const session = await getSession(request);
  await requireAdmin(request);
  const { ticketId } = params;
  invariant(ticketId, "Ticket ID is required");
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(ticketId) },
  });
  if (!ticket) {
    throw badRequest(`Ticket with id ${ticketId} not found`);
  }

  const form = Object.fromEntries(await request.formData());
  try {
    const { actionType, assignedToUserId, comments } =
      ticketAssignmentSchema.parse(form);
    const data = {
      ticketId: ticket.id,
      assignedToUserId,
      comments,
      createdByUserId: user.id,
    };

    // Ticket reassignment
    if (actionType === "assignment") {
      await reassignTicket({ ...data, ticketStatusId: ticket.ticketStatusId });
      return redirectWithToast(`/admin/tickets/${ticketId}/events`, session, {
        message: "Ticket assigned successfully",
        type: "success",
      });
    }

    // Ticket resolution or notes
    if (
      actionType === "close" ||
      actionType === "note" ||
      actionType === "reopen"
    ) {
      await updateTicketStatus({
        ...data,
        ticketStatusId:
          actionType === "close"
            ? 4
            : actionType === "reopen"
            ? 1
            : ticket.ticketStatusId,
      });
      return redirectWithToast(`/admin/tickets/${ticketId}/events`, session, {
        message:
          actionType === "close"
            ? "Ticket closed successfully"
            : actionType === "reopen"
            ? "Ticket reopened successfully"
            : "Note added successfully",
        type: "success",
      });
    }
  } catch (error) {
    console.error(error);
  }
}

export default function TicketActions() {
  const { ticket, campusUsers } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const formName =
    searchParams.get("form") ?? (ticket.status.id === 4 ? "reopen" : "close");
  const attendants = campusUsers.filter((user) => user.role === "ATTENDANT");
  const machineTechs = campusUsers.filter(
    (user) => user.role === "MACHINETECH"
  );
  const campusTechs = campusUsers.filter((user) => user.role === "CAMPUSTECH");

  function actionIsAvailable(actionName: string, statusId: number) {
    const canClose = [1, 2, 3, 5, 6, 7, 8, 9, 10];
    const canAssignAttendant = [1, 8, 9];
    const canAssignTech = [1, 2, 8, 9, 10];
    const canReopen = 4;

    switch (actionName) {
      case "close":
        return canClose.includes(statusId);
      case "attendant":
        return canAssignAttendant.includes(statusId);
      case "machineTech":
      case "campusTech":
        return canAssignTech.includes(statusId);
      case "reopen":
        return statusId === canReopen;
      case "note":
        return true;
      default:
        return false;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-start gap-4">
        {actions.map((action) => {
          if (actionIsAvailable(action.name, ticket.status.id)) {
            return (
              <ButtonLink
                to={`?form=${action.name}`}
                replace={true}
                variant={action.name === formName ? "primary" : "secondary"}
                key={action.name}
              >
                {action.title}
                {action.icon}
              </ButtonLink>
            );
          }
          return null;
        })}
      </div>
      <Form method="post" className="max-w-sm space-y-4">
        {formName === "close" ? (
          <CloseForm />
        ) : formName === "attendant" ? (
          <AttendantForm campusUsers={attendants} />
        ) : formName === "machineTech" ? (
          <MachineTechForm campusUsers={machineTechs} />
        ) : formName === "campusTech" ? (
          <CampusTechForm campusUsers={campusTechs} />
        ) : formName === "note" ? (
          <AddNoteForm />
        ) : formName === "reopen" ? (
          <ReopenForm />
        ) : null}
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}

const iconSize = 18;
const stroke = 2;
const actions = [
  {
    name: "close",
    title: "Close",
    icon: <IconLock size={iconSize} stroke={stroke} />,
  },
  {
    name: "attendant",
    title: "Assign Attendant",
    icon: <IconUserPlus size={iconSize} stroke={stroke} />,
  },
  {
    name: "machineTech",
    title: "Assign Machine Tech",
    icon: <IconUserPlus size={iconSize} stroke={stroke} />,
  },
  {
    name: "campusTech",
    title: "Assign Campus Tech",
    icon: <IconUserPlus size={iconSize} stroke={stroke} />,
  },
  {
    name: "note",
    title: "Add Note",
    icon: <IconNotes size={iconSize} stroke={stroke} />,
  },
  {
    name: "reopen",
    title: "Reopen",
    icon: <IconLockOpen size={iconSize} stroke={stroke} />,
  },
] as const;
