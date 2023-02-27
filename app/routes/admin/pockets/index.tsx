import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import { CustomLink } from "~/components/shared/CustomLink";
import { PageHeader } from "~/components/shared/PageHeader";
import type { TableColumn } from "~/components/tables";
import {
  TableBody,
  TableCell,
  TableHead,
  TableWrapper,
} from "~/components/tables";
import { useSortableData } from "~/hooks/useSortableData";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { classNames } from "~/utils/utils";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);

  const pockets = await prisma.pocket.findMany({
    include: { location: { include: { campus: true } } },
  });
  const flatPockets = pockets.map((p) => ({
    ...p,
    location: p.location.name,
    campus: p.location.campus.name,
  }));
  return json({ pockets: flatPockets });
}

export default function LocationIndex() {
  const { pockets } = useLoaderData<typeof loader>();
  const { items, requestSort, sortConfig } = useSortableData<typeof pockets>(
    pockets,
    { key: "campus", direction: "asc" }
  );

  return (
    <main className="flex flex-col">
      <PageHeader
        title="Pockets"
        actionIcon={<IconPlus size={18} />}
        actionText="Add Pocket"
        href="/admin/pockets/new"
      />
      <TableWrapper>
        <TableHead
          columns={columns}
          sortConfig={sortConfig}
          sortFn={requestSort}
          includeActionCol
        />
        <TableBody>
          {items.map((pocket, index) => {
            return (
              <tr
                key={pocket.id}
                className={classNames(
                  index % 2 === 0 ? undefined : "bg-gray-50"
                )}
              >
                <TableCell>{pocket.campus}</TableCell>
                <TableCell>{pocket.location}</TableCell>
                <TableCell>{pocket.floor}</TableCell>
                <TableCell>{pocket.position}</TableCell>
                <TableCell>{pocket.description}</TableCell>
                <TableCell>
                  <CustomLink to={`/admin/pockets/${pocket.id}`}>
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
  { key: "location", title: "Location", sortable: true },
  { key: "floor", title: "Floor", sortable: false },
  { key: "position", title: "Position", sortable: false },
  { key: "description", title: "Description", sortable: false },
];
