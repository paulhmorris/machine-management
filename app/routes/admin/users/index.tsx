import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { IconChevronRight, IconPlus } from "@tabler/icons-react";
import { CaughtError } from "~/components/shared/CaughtError";
import { PageHeader } from "~/components/shared/PageHeader";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getFormattedEnum } from "~/utils/formatters";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  const users = await prisma.user.findMany({
    include: { campusUserRole: true },
    orderBy: { lastName: "asc" },
  });
  return json({ users });
}

export default function UserIndex() {
  const { users } = useLoaderData<typeof loader>();
  return (
    <main className="flex flex-col">
      <PageHeader
        title="Users"
        actionText="New User"
        href="/admin/users/new"
        actionIcon={<IconPlus size={18} />}
      />
      <ul className="divide-y divide-gray-200 pb-24">
        {users.map((user) => (
          <li key={user.email}>
            <Link
              to={`/admin/users/${user.id}`}
              className="block hover:bg-gray-50"
            >
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="flex min-w-0 flex-1 items-center">
                  <div className="min-w-0 flex-1 px-4 text-sm md:grid md:grid-cols-3 md:gap-4 ">
                    <p className="truncate font-medium text-cyan-700">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-gray-500">
                      {getFormattedEnum(user.role)}
                    </p>
                  </div>
                </div>
                <div>
                  <IconChevronRight size={20} aria-hidden="true" />
                </div>
              </div>
            </Link>
          </li>
        ))}
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
