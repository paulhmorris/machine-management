import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import { CaughtError } from "~/components/shared/CaughtError";
import { CustomLink } from "~/components/shared/CustomLink";
import { UncaughtError } from "~/components/shared/UncaughtError";
import type { TableColumn } from "~/components/tables";
import { TableBody, TableCell, TableHead, TableHeader, TableWrapper } from "~/components/tables";
import { useSortableData } from "~/hooks/useSortableData";
import { getAllCampuses } from "~/models/campus.server";
import { requireAdmin } from "~/utils/auth.server";
import { cn } from "~/utils/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({ campuses: await getAllCampuses() });
}

export default function CampusIndex() {
  const { campuses } = useLoaderData<typeof loader>();
  const { items, requestSort, sortConfig } = useSortableData<typeof campuses>(campuses, {
    key: "name",
    direction: "asc",
  });

  return (
    <main className="flex flex-col">
      <TableHeader
        title="Campuses"
        actionIcon={<IconPlus size={18} />}
        actionText="Add Campus"
        href="/admin/campuses/new"
      />
      <TableWrapper>
        <TableHead columns={columns} sortConfig={sortConfig} sortFn={requestSort} includeActionCol />
        <TableBody>
          {items.map((campus, index) => {
            return (
              <tr key={campus.id} className={cn(index % 2 === 0 ? undefined : "bg-gray-50")}>
                <TableCell>{campus.name}</TableCell>
                <TableCell>
                  <CustomLink to={`/admin/campuses/${campus.id}`}>Edit</CustomLink>
                </TableCell>
              </tr>
            );
          })}
        </TableBody>
      </TableWrapper>
    </main>
  );
}

const columns: TableColumn[] = [{ key: "name", title: "Name", sortable: true }];

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
