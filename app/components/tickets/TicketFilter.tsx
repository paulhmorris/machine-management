import type { TicketStatus } from "@prisma/client";
import { Form, useSearchParams, useTransition } from "@remix-run/react";
import { IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import type { Filter } from "~/components/shared/TableFilters";
import { TableFilters } from "~/components/shared/TableFilters";

type Props = {
  ticketStatuses: TicketStatus[];
};
export function TicketFilter({ ticketStatuses }: Props) {
  const transition = useTransition();
  const [searchParams] = useSearchParams();

  const urlStatuses = searchParams.getAll("status[]");
  const defaultStatuses = ticketStatuses
    .filter((s) => s.name !== "Closed")
    .map((s) => s.id.toString());
  const statuses = urlStatuses.length ? urlStatuses : defaultStatuses;
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  const filters: Filter[] = [
    {
      id: "status",
      name: "Status",
      options: ticketStatuses.map((s) => ({
        value: s.id,
        label: s.name,
        defaultSelected: statuses.includes(s.id.toString()),
      })),
    },
  ];

  return (
    <Form method="get" className="mt-6 flex flex-col gap-3 text-sm">
      <TableFilters filters={filters} direction="right" unmount={false} />
      <div className="flex gap-2">
        <Input
          label="From"
          name="dateFrom"
          type="date"
          defaultValue={dateFrom}
        />
        <Input
          label="To"
          name="dateTo"
          type="date"
          max={dayjs().format("YYYY-MM-DD")}
          defaultValue={dateTo}
        />
      </div>
      <div>
        <Button type="submit" disabled={transition.state === "submitting"}>
          <span>Refresh</span>
          <IconRefresh size={18} />
        </Button>
      </div>
    </Form>
  );
}
