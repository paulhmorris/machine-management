import type { TicketStatus } from "@prisma/client";
import { Form, useSearchParams, useTransition } from "@remix-run/react";
import { IconFilter, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FormMenu } from "~/components/shared/FormMenu";
import { Input } from "~/components/shared/Input";

type Props = {
  ticketStatuses: TicketStatus[];
};
export function TicketFilterForm({ ticketStatuses }: Props) {
  const transition = useTransition();
  const [searchParams] = useSearchParams();

  const urlStatuses = searchParams.getAll("status");
  const defaultStatuses = ticketStatuses
    .filter((s) => s.name !== "Closed")
    .map((s) => s.id.toString());
  const statuses = urlStatuses.length ? urlStatuses : defaultStatuses;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  return (
    <Form method="get" className="mt-6 flex flex-col gap-3 text-sm">
      <FormMenu title="Filters" icon={<IconFilter size={20} />}>
        <div className="flex flex-col space-y-3 whitespace-nowrap text-sm">
          {ticketStatuses.map((status) => {
            return (
              <div
                key={`status-${status.id}`}
                className="relative inline-flex items-start"
              >
                <div className="flex h-5 items-center">
                  <input
                    id={`status-${status.id}`}
                    value={status.id}
                    aria-describedby="comments-description"
                    defaultChecked={statuses.includes(status.id.toString())}
                    name="status"
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-cyan-600 transition duration-75 focus:ring-gray-200"
                  />
                </div>
                <div className="ml-3">
                  <label
                    htmlFor={`status-${status.id}`}
                    className="cursor-pointer font-medium"
                  >
                    {status.name}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </FormMenu>
      <div className="flex gap-2">
        <Input
          label="From"
          name="dateFrom"
          type="date"
          className="text-sm"
          defaultValue={dateFrom}
        />
        <Input
          label="To"
          name="dateTo"
          type="date"
          className="text-sm"
          max={dayjs().format("YYYY-MM-DD")}
          defaultValue={dateTo}
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={transition.state === "submitting"}
          className="inline-flex w-min items-center justify-center space-x-2 rounded-md bg-cyan-700 px-3 py-2 text-sm font-medium text-white shadow-sm transition duration-75 hover:bg-cyan-800 focus:outline-none focus:ring focus:ring-cyan-600 focus:ring-opacity-25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Refresh</span>
          <IconRefresh size={18} />
        </button>
      </div>
    </Form>
  );
}
