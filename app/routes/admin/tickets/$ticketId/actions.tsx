import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
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
import { Select } from "~/components/shared/Select";
import { Textarea } from "~/components/shared/Textarea";
import { getCampusUsers } from "~/models/campusUser.server";
import { getTicketWithCampusId } from "~/models/ticket.server";
import { requireAdmin, requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { redirectWithToast } from "~/utils/toast.server";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  invariant(ticketId, "Ticket ID is required");

  const ticket = await getTicketWithCampusId(Number(ticketId));
  if (!ticket) {
    throw new Response(`Ticket with id ${ticketId} not found`, { status: 404 });
  }
  const campusUsers = await getCampusUsers(
    ticket.machine.pocket.location.campus.id
  );
  return json({ ticket, campusUsers });
}
type CampusUsers = SerializeFrom<typeof loader>["campusUsers"];

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  const session = await getSession(request);
  await requireAdmin(request);
  const { ticketId } = params;
  invariant(ticketId, "Ticket ID is required");

  const form = await request.formData();
  const actionType = form.get("actionType");
  const comments = form.get("comments");
  invariant(typeof actionType === "string", "Action type is required");
  invariant(typeof comments === "string", "Comments are required");

  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(ticketId) },
  });
  if (!ticket) {
    throw new Response(`Ticket with id ${ticketId} not found`, { status: 404 });
  }
  // Ticket assignment
  if (actionType === "assignment") {
    const assignedToUserId = form.get("assignedToUserId");
    invariant(
      assignedToUserId && typeof assignedToUserId === "string",
      "userId is required for this action type"
    );
    await prisma.ticket.update({
      where: { id: Number(ticketId) },
      data: { assignedToUserId },
    });
    await prisma.ticketEvent.create({
      data: {
        ticketId: Number(ticketId),
        assignedToUserId,
        createdByUserId: userId,
        ticketStatusId: ticket.ticketStatusId,
        comments: comments || null,
      },
    });
    return redirectWithToast(`/admin/tickets/${ticketId}/events`, session, {
      message: "Ticket assigned successfully",
      type: "success",
    });
  }

  // Ticket resolution or add notes
  if (
    actionType === "close" ||
    actionType === "note" ||
    actionType === "reopen"
  ) {
    invariant(comments, "Comments are required for this action type");
    const updatedTicket = await prisma.ticket.update({
      where: { id: Number(ticketId) },
      data: {
        ticketStatusId:
          actionType === "close"
            ? 4
            : actionType === "reopen"
            ? 1
            : ticket.ticketStatusId,
      },
    });
    await prisma.ticketEvent.create({
      data: {
        ticketId: Number(ticketId),
        createdByUserId: userId,
        ticketStatusId: updatedTicket.ticketStatusId,
        comments,
        assignedToUserId: ticket.assignedToUserId,
      },
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

const iconSize = 14;
const stroke = 3;
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
];
function CloseForm() {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Close Ticket</h2>
      <input type="hidden" name="actionType" value="close" />
      <Textarea
        name="comments"
        label="Comments"
        resizeable={false}
        rows={6}
        maxLength={255}
        required
      />
    </div>
  );
}
function AttendantForm({ campusUsers }: { campusUsers: CampusUsers }) {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Assign Attendant</h2>
      <input type="hidden" name="actionType" value="assignment" />
      <Select
        label="Attendants"
        name="assignedToUserId"
        defaultValue=""
        required
      >
        <option value="" disabled>
          Select an Attendant
        </option>
        {campusUsers.map((user) => {
          const userData = user.user;
          return (
            <option key={userData.id} value={userData.id}>
              {userData.firstName} {userData.lastName}
            </option>
          );
        })}
      </Select>
      <Textarea
        name="comments"
        label="Comments"
        resizeable={false}
        rows={6}
        maxLength={255}
      />
    </div>
  );
}
function MachineTechForm({ campusUsers }: { campusUsers: CampusUsers }) {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Assign Machine Tech</h2>
      <input type="hidden" name="actionType" value="assignment" />
      <Select
        label="Machine Techs"
        name="assignedToUserId"
        defaultValue=""
        required
      >
        <option value="" disabled>
          Select a Tech
        </option>
        {campusUsers.map((user) => {
          const userData = user.user;
          return (
            <option key={userData.id} value={userData.id}>
              {userData.firstName} {userData.lastName}
            </option>
          );
        })}
      </Select>
      <Textarea
        name="comments"
        label="Comments"
        resizeable={false}
        rows={6}
        maxLength={255}
      />
    </div>
  );
}
function CampusTechForm({ campusUsers }: { campusUsers: CampusUsers }) {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Assign Campus Tech</h2>
      <input type="hidden" name="actionType" value="assignment" />
      <Select
        label="Campus Techs"
        name="assignedToUserId"
        defaultValue=""
        required
      >
        <option value="" disabled>
          Select a Tech
        </option>
        {campusUsers.map((user) => {
          const userData = user.user;
          return (
            <option key={userData.id} value={userData.id}>
              {userData.firstName} {userData.lastName}
            </option>
          );
        })}
      </Select>
      <Textarea
        name="comments"
        label="Comments"
        resizeable={false}
        rows={6}
        maxLength={255}
      />
    </div>
  );
}
function AddNoteForm() {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Add Note</h2>
      <input type="hidden" name="actionType" value="note" />
      <Textarea
        name="comments"
        label="Comments"
        resizeable={false}
        rows={6}
        maxLength={255}
        required
      />
    </div>
  );
}

function ReopenForm() {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Reopen</h2>
      <input type="hidden" name="actionType" value="reopen" />
      <Textarea
        name="comments"
        label="Comments"
        resizeable={false}
        rows={6}
        maxLength={255}
        required
      />
    </div>
  );
}
