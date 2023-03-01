import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import { ButtonLink } from "~/components/shared/ButtonLink";
import { CaughtError } from "~/components/shared/CaughtError";
import { PageHeader } from "~/components/shared/PageHeader";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  return json({ campuses: await prisma.campus.findMany() });
}

export default function CampusIndex() {
  const { campuses } = useLoaderData<typeof loader>();

  return (
    <main className="flex flex-col">
      <PageHeader
        title="Campuses"
        actionText="New Campus"
        actionIcon={<IconPlus size={18} />}
        href="/admin/campuses/new"
      />
      <ul className="flex max-w-md flex-col gap-4">
        {campuses.map((campus) => {
          return (
            <li
              className="rounded-md border border-gray-300 bg-white p-4"
              key={campus.id}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{campus.name}</h3>
                <ButtonLink to={`/admin/campuses/${campus.id}`}>
                  Edit
                </ButtonLink>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
