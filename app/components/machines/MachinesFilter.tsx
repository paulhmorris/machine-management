import type { Campus, Location, MachineType } from "@prisma/client";
import { Form, useNavigation } from "@remix-run/react";
import { IconRefresh } from "@tabler/icons-react";
import { Button } from "~/components/shared/Button";
import { Select } from "~/components/shared/Select";
import type { Filter } from "~/components/shared/TableFilters";
import { TableFilters } from "~/components/shared/TableFilters";
import { MachineQueryParam } from "~/routes/admin.machines._index";
import { getBusyState } from "~/utils/utils";

type Props = {
  campuses: Array<Pick<Campus, "id" | "name">>;
  locations: Array<Pick<Location, "id" | "name">>;
  machineTypes: Array<Pick<MachineType, "id" | "name">>;
};
export function MachinesFilter({ campuses, locations, machineTypes }: Props) {
  const navigation = useNavigation();
  const busy = getBusyState(navigation);

  const filters: Array<Filter<MachineQueryParam>> = [
    {
      id: "campus",
      name: "Campus",
      options: campuses.map((c) => ({
        value: c.id,
        label: c.name,
        defaultSelected: true,
      })),
    },
    {
      id: "type",
      name: "Machine Type",
      options: machineTypes.map((mt) => ({
        value: mt.id,
        label: mt.name,
        defaultSelected: true,
      })),
    },
  ];

  return (
    <Form method="get" className="space-y-4" replace={true}>
      <div>
        <TableFilters unmount={false} filters={filters} />
      </div>
      <Select name="loc" label="Locations" className="w-min">
        <option value="all">All Locations</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </Select>
      <Button type="submit" disabled={busy}>
        <span>{busy ? "Refreshing..." : "Refresh"}</span>
        <IconRefresh className={busy ? "animate-spin" : ""} size={18} />
      </Button>
    </Form>
  );
}
