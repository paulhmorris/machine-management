import { Disclosure } from "@headlessui/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Outlet,
  useActionData,
  useFetcher,
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
import { z } from "zod";
import { AbandonInvoiceModal } from "~/components/invoices/AbandonInvoiceModal";
import { InvoiceSummary } from "~/components/invoices/InvoiceSummary";
import { Button } from "~/components/shared/Button";
import { ButtonNavLink } from "~/components/shared/ButtonNavLink";
import { Input } from "~/components/shared/Input";
import { getInvoiceById } from "~/models/invoice.server";
import {
  addChargeSchema,
  addLaborSchema,
  addPartSchema,
  addReimbursementSchema,
  addShippingSchema,
  addTicketToInvoiceSchema,
  addTripSchema,
  deleteChargeSchema,
  finishInvoiceSchema,
} from "~/schemas/invoice";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { capitalize, formatCurrency } from "~/utils/formatters";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, classNames } from "~/utils/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { invoiceId } = params;
  invariant(typeof invoiceId === "string", "Expected invoiceId");
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw badRequest(`Invoice ${invoiceId} found`);
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

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    throw badRequest(`Invoice ${invoiceId} not found`);
  }

  const form = Object.fromEntries(await request.formData());

  try {
    // Add Ticket
    const { actionType, ticketId } = addTicketToInvoiceSchema.parse(form);
    if (actionType === "ticket") {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { id: true },
      });
      if (!ticket) {
        return json(
          { errors: { ticketId: { _errors: ["Ticket not found"] } } },
          { status: 400 }
        );
      }
      if (invoice.tickets.some((t) => t.id === ticket.id)) {
        return json(
          {
            errors: {
              ticketId: { _errors: ["Ticket already added to invoice"] },
            },
          },
          { status: 400 }
        );
      }
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: { tickets: { connect: { id: ticket.id } } },
      });
      return json({ updatedInvoice });
    }

    // Add Charge
    if (
      actionType === "labor" ||
      actionType === "trip" ||
      actionType === "part" ||
      actionType === "shipping" ||
      actionType === "reimbursement"
    ) {
      const { isWarranty, chargeAmount } = addChargeSchema.parse(form);

      // Set descriptions for each charge type
      let description: string | undefined = undefined;
      switch (actionType) {
        case "labor":
          const { time } = addLaborSchema.parse(form);
          description = `${time} minutes`;
          break;
        case "trip":
          const { tripChargeDate } = addTripSchema.parse(form);
          description = `${dayjs(tripChargeDate).format("M/D/YYYY")}`;
          break;
        case "shipping":
          const { shippingDate } = addShippingSchema.parse(form);
          description = `${dayjs(shippingDate).format("M/D/YYYY")}`;
          break;
        case "reimbursement":
          const { reimbursedUser } = addReimbursementSchema.parse(form);
          description = reimbursedUser;
          break;
      }

      const newCharge = await prisma.charge.create({
        data: {
          ticket: { connect: { id: ticketId } },
          invoice: { connect: { id: invoice.id } },
          vendor: { connect: { id: invoice.vendorId } },
          warrantyCovered: isWarranty ? true : false,
          actualCost: chargeAmount,
          description,
          part:
            actionType === "part"
              ? { connect: { id: addPartSchema.parse(form).partId } }
              : undefined,
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
        },
      });
      return jsonWithToast({ newCharge }, session, {
        type: "success",
        message: `${capitalize(actionType)} charge added!`,
      });
    }

    // Delete Charge
    if (actionType === "deleteCharge") {
      const { chargeId } = deleteChargeSchema.parse(form);
      const charge = await prisma.charge.delete({
        where: { id: chargeId },
      });
      return jsonWithToast({ charge }, session, {
        type: "success",
        message: "Charge deleted",
      });
    }

    // Finish Invoice
    if (actionType === "finishInvoice") {
      const { vendorInvoiceNumber, vendorInvoiceDate } =
        finishInvoiceSchema.parse(form);
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(error.format());
      return json({ errors: error }, { status: 400 });
    }
    console.error(error);
  }
}

export default function Invoice() {
  const { invoice, parts } = useTypedLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useTransition();
  const fetcher = useFetcher();
  const [openAbandon, setOpenAbandon] = useState(false);
  const busy = transition.state === "submitting";

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
            {actions.map(({ href, icon, title }) => {
              const isDisabled =
                href !== "ticket" && invoice.tickets.length === 0;
              return (
                <ButtonNavLink
                  to={href}
                  replace={true}
                  key={href}
                  disabled={isDisabled}
                  title={isDisabled ? "Add a ticket first" : undefined}
                >
                  {title}
                  {icon}
                </ButtonNavLink>
              );
            })}
          </div>
          {/* A bit lengthy, but controls form rendering logic */}
          <Outlet />
          {/* <fetcher.Form
            className="mt-4 flex max-w-xs flex-col gap-3"
            method="post"
          >
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
                    error={actionData?.ticketId?._errors}
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
          </fetcher.Form> */}
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
                                  <span>
                                    {charge.part?.name ?? charge.description}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 place-self-end">
                                  {charge.warrantyCovered && (
                                    <span className="font-bold text-cyan-700/75">
                                      IW
                                    </span>
                                  )}
                                  <span>
                                    {formatCurrency(charge.actualCost)}
                                  </span>
                                  <fetcher.Form method="post">
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
                                    <input
                                      type="hidden"
                                      name="ticketId"
                                      value={charge.ticketId}
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
                                  </fetcher.Form>
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

        <fetcher.Form className="space-y-2 pb-24 pt-8" method="post">
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
        </fetcher.Form>
      </main>
    </>
  );
}

const iconSize = 18;
const stroke = 2;
const actions = [
  {
    href: "ticket",
    title: "Ticket",
    icon: <IconTicket size={iconSize} stroke={stroke} />,
  },
  {
    href: "trip",
    title: "Trip Charge",
    icon: <IconTruckDelivery size={iconSize} stroke={stroke} />,
  },
  {
    href: "shipping",
    title: "Shipping",
    icon: <IconPackage size={iconSize} stroke={stroke} />,
  },
  {
    href: "labor",
    title: "Labor",
    icon: <IconClock size={iconSize} stroke={stroke} />,
  },
  {
    href: "part",
    title: "Part",
    icon: <IconTool size={iconSize} stroke={stroke} />,
  },
  {
    href: "reimbursement",
    title: "Reimbursement",
    icon: <IconCurrencyDollar size={iconSize} stroke={stroke} />,
  },
];
