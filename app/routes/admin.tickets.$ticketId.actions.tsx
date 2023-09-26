import { Tab } from "@headlessui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { IconLock, IconLockOpen, IconNotes, IconUserPlus } from "@tabler/icons-react";
import { Fragment } from "react";
import invariant from "tiny-invariant";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import {
  AddNoteForm,
  AttendantForm,
  CampusTechForm,
  CloseForm,
  MachineTechForm,
  ReopenForm,
} from "~/components/tickets/ActionForms";
import { getCampusUsers } from "~/models/campusUser.server";
import { getTicketById, getTicketWithCampusId, reassignTicket, updateTicketStatus } from "~/models/ticket.server";
import { getUserWithCampusRole } from "~/models/user.server";
import { ticketActionSchema, ticketAssignmentSchema } from "~/schemas/ticketSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { sendMachineReportEmail } from "~/utils/mail.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { actionIsAvailable, badRequest, getBusyState, notFoundResponse } from "~/utils/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  invariant(ticketId, "Ticket ID is required");

  const ticket = await getTicketWithCampusId(Number(ticketId));
  if (!ticket) {
    throw notFoundResponse(`Ticket ${ticketId} not found`);
  }
  const campusUsers = await getCampusUsers(ticket.machine.pocket.location.campus.id);
  return json({ ticket, campusUsers });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireAdmin(request);
  const session = await getSession(request);
  await requireAdmin(request);
  const { ticketId } = params;
  if (!ticketId) throw badRequest("Ticket ID is required");
  const ticket = await getTicketById(Number(ticketId));
  if (!ticket) throw notFoundResponse(`Ticket ${ticketId} not found`);

  const form = Object.fromEntries(await request.formData());
  const result = ticketActionSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 404 }, session, {
      message: "Unknown action type",
      type: "error",
    });
  }
  const { comments, actionType } = result.data;
  // Ticket reassignment
  if (actionType === "assignment") {
    const result = ticketAssignmentSchema.safeParse(form);
    if (!result.success) {
      return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 404 }, session, {
        message: "Error updating ticket",
        type: "error",
      });
    }
    const { assignedToUserId } = result.data;

    const assignedTo = await getUserWithCampusRole(assignedToUserId);
    const updatedStatus = assignedTo?.campusUserRole?.role === "ATTENDANT" ? 2 : 5;
    await reassignTicket({
      ticketId: ticket.id,
      assignedToUserId,
      createdByUserId: user.id,
      ticketStatusId: updatedStatus,
    });
    await sendMachineReportEmail({ ticketId: ticket.id, notes: comments });

    return redirectWithToast(`/admin/tickets/${ticketId}/events`, session, {
      message: "Ticket assigned successfully",
      type: "success",
    });
  }

  // Ticket resolution or notes
  if (actionType === "close" || actionType === "note" || actionType === "reopen") {
    await updateTicketStatus({
      ticketId: ticket.id,
      assignedToUserId: actionType === "close" ? null : actionType === "reopen" ? user.id : ticket.assignedToUserId,
      createdByUserId: user.id,
      comments,
      ticketStatusId: actionType === "close" ? 4 : actionType === "reopen" ? 9 : ticket.ticketStatusId,
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
  const navigation = useNavigation();
  const busy = getBusyState(navigation);

  const attendants = campusUsers.filter(({ role }) => role === "ATTENDANT");
  const machineTechs = campusUsers.filter(({ role }) => role === "MACHINE_TECH");
  const campusTechs = campusUsers.filter(({ role }) => role === "CAMPUS_TECH");

  return (
    <div className="flex flex-col gap-8">
      <Tab.Group>
        <Tab.List as="div" className="flex flex-wrap justify-start gap-4">
          {actions.map((action) => {
            return (
              <Tab as="div" key={action.name} className="disabled:pointer-events-none disabled:opacity-50">
                {({ selected }) => (
                  <Button
                    variant={selected ? "primary" : "secondary"}
                    disabled={!actionIsAvailable(action.name, ticket.status.id)}
                  >
                    {action.title}
                    {action.icon}
                  </Button>
                )}
              </Tab>
            );
          })}
        </Tab.List>
        <Form method="post" className="max-w-sm">
          <Tab.Panels as={Fragment}>
            <Tab.Panel>
              <CloseForm />
            </Tab.Panel>
            <Tab.Panel>
              <AttendantForm campusUsers={attendants} />
            </Tab.Panel>
            <Tab.Panel>
              <MachineTechForm campusUsers={machineTechs} />
            </Tab.Panel>
            <Tab.Panel>
              <CampusTechForm campusUsers={campusTechs} />
            </Tab.Panel>
            <Tab.Panel>
              <AddNoteForm />
            </Tab.Panel>
            <Tab.Panel>
              <ReopenForm />
            </Tab.Panel>
          </Tab.Panels>
          <Button type="submit" disabled={busy} className="mt-4">
            {busy && <Spinner className="mr-2" />}
            {busy ? "Submitting..." : "Submit"}
          </Button>
        </Form>
      </Tab.Group>
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

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
