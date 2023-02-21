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
import { requireVendorOrAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { classNames } from "~/utils/utils";

export type MachineQueryParam = "campus" | "loc" | "type";

export async function loader({ request }: LoaderArgs) {
  await requireVendorOrAdmin(request);
  const url = new URL(request.url);
  const campusIds = url.searchParams.getAll("campus");
  const locationIds = url.searchParams.getAll("loc");
  const machineTypeQuery = url.searchParams.getAll("type") ?? undefined;

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
  return json({ machines, locations, campuses, machineTypes });
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
      <div className="mt-4">
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
                  <TableCell>{machine.pocket.location.campus.name}</TableCell>
                  <TableCell>{machine.publicId}</TableCell>
                  <TableCell>{machine.type.name}</TableCell>
                  <TableCell>{machine.pocket.location.name}</TableCell>
                  <TableCell>{machine.pocket.floor ?? ""}</TableCell>
                  <TableCell>
                    <CustomLink to={`/admin/machines/${machine.id}`}>
                      View
                    </CustomLink>
                  </TableCell>
                </tr>
              );
            })}
          </TableBody>
        </TableWrapper>
      </div>
    </main>
  );
}

const columns: TableColumn[] = [
  { key: "campus", title: "Campus", sortable: true },
  { key: "publicId", title: "Id", sortable: true },
  { key: "type", title: "Type", sortable: true },
  { key: "location", title: "Location", sortable: true },
  { key: "floor", title: "Floor", sortable: true },
];
