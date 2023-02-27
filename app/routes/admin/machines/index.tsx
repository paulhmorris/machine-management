import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import { MachinesFilter } from "~/components/machines/MachinesFilter";
import { CustomLink } from "~/components/shared/CustomLink";
import type { TableColumn } from "~/components/tables";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableWrapper,
} from "~/components/tables";
import { useSortableData } from "~/hooks/useSortableData";
import { getMachinesForTable } from "~/models/machine.server";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { classNames, getAllSearchParams } from "~/utils/utils";

export type MachineQueryParam = "campus" | "loc" | "type";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  const campusIds = getAllSearchParams("campus", request);
  const locationIds = getAllSearchParams("loc", request);
  const machineTypeQuery = getAllSearchParams("type", request);

  const select = { id: true, name: true };
  const machineTypes = await prisma.machineType.findMany({ select });
  const campuses = await prisma.campus.findMany({ select });
  const locations = await prisma.location.findMany({ select });
  const machines = await getMachinesForTable({
    // Query filters
    where: {
      ...(campusIds.length
        ? { pocket: { location: { campusId: { in: campusIds } } } }
        : {}),
      ...(locationIds.length && !locationIds.includes("all")
        ? { pocket: { locationId: { in: locationIds } } }
        : {}),
      ...(machineTypeQuery.length
        ? { machineTypeId: { in: machineTypeQuery.map((m) => Number(m)) } }
        : {}),
    },
  });
  const flatMachines = machines.map((m) => ({
    ...m,
    campus: m.pocket.location.campus.name,
    location: m.pocket.location.name,
    type: m.type.name,
  }));
  return json({ machines: flatMachines, locations, campuses, machineTypes });
}

export default function TicketIndex() {
  const { machines, locations, campuses, machineTypes } =
    useLoaderData<typeof loader>();
  const { items, requestSort, sortConfig } = useSortableData<typeof machines>(
    machines,
    { key: "publicId", direction: "asc" }
  );

  return (
    <main className="flex flex-col">
      <TableHeader
        title="Machines"
        actionIcon={<IconPlus size={18} />}
        actionText="Add Machine"
        href="/admin/machines/new"
      />
      <MachinesFilter
        locations={locations}
        campuses={campuses}
        machineTypes={machineTypes}
      />
      <TableWrapper>
        <TableHead
          columns={columns}
          sortConfig={sortConfig}
          sortFn={requestSort}
          includeActionCol
        />
        <TableBody>
          {items.map((machine, index) => {
            return (
              <tr
                key={machine.id}
                className={classNames(
                  index % 2 === 0 ? undefined : "bg-gray-50"
                )}
              >
                <TableCell>{machine.campus}</TableCell>
                <TableCell>{machine.publicId}</TableCell>
                <TableCell>{machine.type}</TableCell>
                <TableCell>{machine.location}</TableCell>
                <TableCell>{machine.pocket.floor ?? ""}</TableCell>
                <TableCell>
                  <CustomLink to={`/admin/machines/${machine.id}`}>
                    Edit
                  </CustomLink>
                </TableCell>
              </tr>
            );
          })}
        </TableBody>
      </TableWrapper>
    </main>
  );
}

const columns: TableColumn[] = [
  { key: "campus", title: "Campus", sortable: true },
  { key: "publicId", title: "Id", sortable: true },
  { key: "type", title: "Type", sortable: true },
  { key: "location", title: "Location", sortable: true },
  { key: "floor", title: "Floor", sortable: false },
];
