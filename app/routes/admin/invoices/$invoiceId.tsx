import { Disclosure } from "@headlessui/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import {
  Form,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import {
  IconChevronRight,
  IconClock,
  IconCurrencyDollar,
  IconPackage,
  IconTicket,
  IconTool,
  IconTrash,
  IconTruckDelivery,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { AbandonInvoiceModal } from "~/components/invoices/AbandonInvoiceModal";
import {
  LaborForm,
  PartForm,
  ReimbursementForm,
  ShippingForm,
  TripForm,
} from "~/components/invoices/Forms";
import { InvoiceSummary } from "~/components/invoices/InvoiceSummary";
import { TicketSelect } from "~/components/invoices/TicketSelect";
import { Button } from "~/components/shared/Button";
import { ButtonLink } from "~/components/shared/ButtonLink";
import { Input } from "~/components/shared/Input";
import { getInvoiceById } from "~/models/invoice.server";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatCurrency } from "~/utils/formatters";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { classNames } from "~/utils/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { invoiceId } = params;
  invariant(typeof invoiceId === "string", "Expected invoiceId");
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new Response(`Invoice ${invoiceId} found`, { status: 404 });
  }
  const parts = await prisma.part.findMany();
  return typedjson({ invoice, parts });
}
export type InvoicePayload = NonNullable<
  Awaited<ReturnType<typeof getInvoiceById>>
>;

export async function action({ request, params }: ActionArgs) {
  const user = await requireAdmin(request);
  const session = await getSession(request);
  const { invoiceId } = params;
  invariant(typeof invoiceId === "string", "Expected invoiceId");
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new Response(`Invoice ${invoiceId} not found`, { status: 400 });
  }
  const form = await request.formData();
  const actionType = form.get("actionType") as ActionTypes;
  const ticketId = form.get("ticketId");

  // Add Ticket
  if (actionType === "ticket") {
    invariant(typeof ticketId === "string", "Expected ticketId");
    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(ticketId) },
      select: { id: true },
    });
    if (!ticket) {
      return json(
        { errors: { ticketId: "Ticket not found" } },
        { status: 400 }
      );
    }
    if (invoice.tickets.some((t) => t.id === ticket.id)) {
      return json(
        { errors: { ticketId: "Ticket already added to invoice" } },
        { status: 400 }
      );
    }
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { tickets: { connect: { id: ticket.id } } },
    });
    return json({ updatedInvoice });
  }

  // Charges
  if (
    actionType === "trip" ||
    actionType === "shipping" ||
    actionType === "labor" ||
    actionType === "part" ||
    actionType === "reimbursement"
  ) {
    invariant(typeof ticketId === "string", "Expected ticketId");
    const chargeAmount = form.get("chargeAmount");
    invariant(typeof chargeAmount === "string", "Expected chargeAmount");
    const user = form.get("reimbursedUser");
    const time = form.get("time");
    const tripChargeDate = form.get("tripChargeDate");
    const shippingDate = form.get("shippingDate");
    const isWarranty = form.get("isWarranty");

    // Set descriptions for each charge type
    let description: string | undefined = undefined;
    if (actionType === "labor") {
      invariant(typeof time === "string", "Expected time for this action");
      description = `${time} minutes`;
    }
    if (actionType === "trip") {
      invariant(
        typeof tripChargeDate === "string",
        "Expected cost for this action type"
      );
      description = `${dayjs(tripChargeDate).format("M/D/YYYY")}`;
    }
    if (actionType === "shipping") {
      invariant(
        typeof shippingDate === "string",
        "Expected shippingDate for this action type"
      );
      description = `${dayjs(shippingDate).format("M/D/YYYY")}`;
    }
    if (actionType === "reimbursement") {
      invariant(
        typeof user === "string",
        "Expected reimbursemedUser for this action type"
      );
      description = user;
    }

    const newCharge = await prisma.charge.create({
      data: {
        ticket: { connect: { id: Number(ticketId) } },
        invoice: { connect: { id: invoice.id } },
        type: {
          connect: {
            id:
              actionType === "labor"
                ? 1
                : actionType === "trip"
                ? 2
                : actionType === "part"
                ? 3
                : actionType === "shipping"
                ? 4
                : actionType === "reimbursement"
                ? 5
                : undefined,
          },
        },
        actualCost: Number(chargeAmount),
        description,
        warrantyCovered: isWarranty ? true : false,
        vendor: { connect: { id: invoice.vendorId } },
      },
    });
    return jsonWithToast({ newCharge }, session, {
      type: "success",
      message: `${actionType.charAt(0).toUpperCase()}${actionType.slice(
        1
      )} charge added!`,
    });
  }

  // Delete Charge
  if (actionType === "deleteCharge") {
    const chargeId = form.get("chargeId");
    invariant(typeof chargeId === "string", "Expected chargeId");
    const charge = await prisma.charge.delete({
      where: { id: Number(chargeId) },
    });
    return jsonWithToast({ charge }, session, {
      type: "success",
      message: "Charge deleted",
    });
  }

  if (actionType === "finishInvoice") {
    const vendorInvoiceNumber = form.get("vendorInvoiceNumber");
    const vendorInvoiceDate = form.get("vendorInvoiceDate");
    invariant(
      typeof vendorInvoiceNumber === "string",
      "Expected vendorInvoiceNumber for this action"
    );
    invariant(
      typeof vendorInvoiceDate === "string",
      "Expected vendorInvoiceDate for this action"
    );

    const total = invoice.charges.reduce(
      (acc, charge) => acc + (charge.warrantyCovered ? 0 : charge.actualCost),
      0
    );
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        vendorInvoiceNumber,
        total,
        invoicedOn: dayjs(vendorInvoiceDate).toDate(),
        submittedOn: new Date(),
        submittedBy: { connect: { id: user.id } },
      },
    });
    return redirectWithToast("/admin/invoices", session, {
      type: "success",
      message: "Invoice submitted!",
    });
  }
}

export default function Invoice() {
  const { invoice, parts } = useTypedLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useTransition();
  const busy = transition.state === "submitting";
  const [searchParams] = useSearchParams();
  const actionType = searchParams.get("actionType") ?? "ticket";
  const [openAbandon, setOpenAbandon] = useState(false);

  return (
    <>
      <AbandonInvoiceModal
        invoiceId={invoice.id}
        open={openAbandon}
        setOpen={setOpenAbandon}
      />
      <main className="flex h-full flex-col pb-24">
        <section className="border-b border-gray-200 pb-4">
          <div className="flex flex-wrap justify-between border-b border-gray-200 pb-8">
            <h1>
              Create Invoice{" "}
              <span className="text-xl text-gray-400">
                for {invoice.vendor.name}
              </span>
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setOpenAbandon(true)} variant="secondary">
                Abandon
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map(({ name, icon, title }) => {
              const isDisabled =
                name !== "ticket" && invoice.tickets.length === 0;
              return (
                <ButtonLink
                  to={`?actionType=${name}`}
                  replace={true}
                  variant={name === actionType ? "primary" : "secondary"}
                  key={name}
                  disabled={isDisabled}
                  title={isDisabled ? "Add a ticket first" : undefined}
                >
                  {title}
                  {icon}
                </ButtonLink>
              );
            })}
          </div>
          {/* A bit lengthy, but controls form rendering logic */}
          <Form className="mt-4 flex max-w-xs flex-col gap-3" method="post">
            <>
              {actionType === "ticket" && (
                <div className="sm:w-32">
                  <input type="hidden" name="actionType" value="ticket" />
                  <Input
                    label="Ticket Number"
                    name="ticketId"
                    placeholder="75226"
                    // @ts-expect-error Having trouble with typing action
                    // eslint-disable-next-line
                    error={actionData?.errors?.ticketId}
                    disabled={busy}
                    required
                  />
                </div>
              )}
              {actionType !== "ticket" && actionType !== null && (
                <TicketSelect tickets={invoice.tickets} />
              )}
              {actionType === "trip" && (
                <TripForm amount={invoice.vendor.tripCharge} />
              )}
              {actionType === "shipping" && <ShippingForm />}
              {actionType === "labor" && (
                <LaborForm rate={invoice.vendor.hourlyRate} />
              )}
              {actionType === "part" && <PartForm parts={parts} />}
              {actionType === "reimbursement" && <ReimbursementForm />}
              {actionType && (
                <Button type="submit" className="w-min" disabled={busy}>
                  Add
                </Button>
              )}
            </>
          </Form>
        </section>

        <section className="mt-4 pb-8">
          <h2 className="mb-4">Add Charges</h2>
          <ul className="flex flex-col space-y-4">
            {invoice.tickets.map((ticket) => {
              const chargeCount = invoice.charges.filter(
                (c) => c.ticketId === ticket.id
              ).length;
              return (
                <Disclosure
                  as="li"
                  className="w-full rounded-md border-l border-t border-r border-gray-200 bg-white"
                  key={ticket.id}
                  defaultOpen={false}
                >
                  {({ open }) => (
                    <>
                      <Disclosure.Button
                        disabled={chargeCount === 0}
                        className={classNames(
                          "flex h-full w-full items-center justify-between border-b border-gray-200 p-4 sm:px-6 lg:px-8",
                          !open && "rounded-md hover:bg-gray-50"
                        )}
                      >
                        <div className="text-left">
                          <span className="block font-medium">
                            Ticket {ticket.id}
                          </span>
                          <span className="block text-sm text-gray-400">
                            {chargeCount} charge{chargeCount === 1 ? "" : "s"}
                          </span>
                        </div>
                        {chargeCount > 0 && (
                          <IconChevronRight
                            size={20}
                            className={
                              open
                                ? "rotate-90 transform transition duration-75"
                                : "transition duration-75"
                            }
                          />
                        )}
                      </Disclosure.Button>
                      <Disclosure.Panel>
                        <ul className="divide-y divide-gray-200 rounded-md border-b border-gray-200 bg-gray-50">
                          {invoice.charges
                            .filter((c) => c.ticketId === ticket.id)
                            .map((charge) => (
                              <li
                                key={charge.id}
                                className="grid grid-cols-3 items-center whitespace-nowrap p-2 text-sm text-gray-500 sm:px-6 lg:px-8"
                              >
                                <div className="text-left">
                                  <span>{charge.type.name}</span>
                                </div>
                                <div className="text-left">
                                  <span>{charge.description}</span>
                                </div>
                                <div className="flex items-center gap-4 place-self-end">
                                  {charge.warrantyCovered && (
                                    <span className="font-medium text-cyan-700/75">
                                      (warrantied)
                                    </span>
                                  )}
                                  <span>
                                    {formatCurrency(charge.actualCost)}
                                  </span>
                                  <Form method="post">
                                    <input
                                      type="hidden"
                                      name="actionType"
                                      value="deleteCharge"
                                    />
                                    <input
                                      type="hidden"
                                      name="chargeId"
                                      value={charge.id}
                                    />
                                    <button
                                      type="submit"
                                      className="group cursor-pointer p-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      disabled={busy}
                                    >
                                      <span className="sr-only">
                                        Delete Charge
                                      </span>
                                      <IconTrash
                                        size={20}
                                        className="transition-colors duration-75 group-hover:text-red-500"
                                      />
                                    </button>
                                  </Form>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              );
            })}
          </ul>
        </section>

        <InvoiceSummary invoice={invoice} />

        <Form className="space-y-2 pb-24 pt-8" method="post">
          <h2>Finish Invoice</h2>
          <input type="hidden" name="actionType" value="finishInvoice" />
          <div className="flex flex-wrap gap-4">
            <Input name="vendorInvoiceNumber" label="Vendor Invoice #" />
            <Input
              type="date"
              name="vendorInvoiceDate"
              label="Vendor Invoice Date"
            />
          </div>
          <Button type="submit" disabled={busy}>
            Finish Invoice
          </Button>
        </Form>
      </main>
    </>
  );
}

const iconSize = 18;
const stroke = 2;
const actions = [
  {
    name: "ticket",
    title: "Ticket",
    icon: <IconTicket size={iconSize} stroke={stroke} />,
  },
  {
    name: "trip",
    title: "Trip Charge",
    icon: <IconTruckDelivery size={iconSize} stroke={stroke} />,
  },
  {
    name: "shipping",
    title: "Shipping",
    icon: <IconPackage size={iconSize} stroke={stroke} />,
  },
  {
    name: "labor",
    title: "Labor",
    icon: <IconClock size={iconSize} stroke={stroke} />,
  },
  {
    name: "part",
    title: "Part",
    icon: <IconTool size={iconSize} stroke={stroke} />,
  },
  {
    name: "reimbursement",
    title: "Reimbursement",
    icon: <IconCurrencyDollar size={iconSize} stroke={stroke} />,
  },
] as const;
type ActionTypes =
  | (typeof actions)[number]["name"]
  | "finishInvoice"
  | "deleteCharge";
