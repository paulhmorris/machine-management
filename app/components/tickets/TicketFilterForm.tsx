import type { TicketStatus } from "@prisma/client";
import { Form, useSearchParams, useTransition } from "@remix-run/react";
import { IconFilter, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Button } from "~/components/shared/Button";
import { Checkbox } from "~/components/shared/Checkbox";
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
              <Checkbox
                key={`status-${status.id}`}
                id={`status-${status.id}`}
                name="status"
                label={status.name}
                defaultChecked={statuses.includes(status.id.toString())}
              />
            );
          })}
        </div>
      </FormMenu>
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
