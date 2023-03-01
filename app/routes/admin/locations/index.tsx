import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import { CaughtError } from "~/components/shared/CaughtError";
import { CustomLink } from "~/components/shared/CustomLink";
import { UncaughtError } from "~/components/shared/UncaughtError";
import type { TableColumn } from "~/components/tables";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableWrapper,
} from "~/components/tables";
import { useSortableData } from "~/hooks/useSortableData";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { classNames } from "~/utils/utils";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);

  const locations = await prisma.location.findMany({
    include: { campus: true },
  });
  const flatLocations = locations.map((l) => ({
    ...l,
    campus: l.campus.name,
  }));
  return json({ locations: flatLocations });
}

export default function LocationIndex() {
  const { locations } = useLoaderData<typeof loader>();
  const { items, requestSort, sortConfig } = useSortableData<typeof locations>(
    locations,
    { key: "name", direction: "asc" }
  );

  return (
    <main className="flex flex-col">
      <TableHeader
        title="Locations"
        actionIcon={<IconPlus size={18} />}
        actionText="Add Location"
        href="/admin/locations/new"
      />
      <TableWrapper>
        <TableHead
          columns={columns}
          sortConfig={sortConfig}
          sortFn={requestSort}
          includeActionCol
        />
        <TableBody>
          {items.map((location, index) => {
            return (
              <tr
                key={location.id}
                className={classNames(
                  index % 2 === 0 ? undefined : "bg-gray-50"
                )}
              >
                <TableCell>{location.campus}</TableCell>
                <TableCell>{location.name}</TableCell>
                <TableCell>{location.description}</TableCell>
                <TableCell>
                  <CustomLink to={`/admin/locations/${location.id}`}>
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
  { key: "name", title: "Name", sortable: true },
  { key: "description", title: "Description", sortable: false },
];

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
