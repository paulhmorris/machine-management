import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import { ButtonLink } from "~/components/shared/ButtonLink";
import { CaughtError } from "~/components/shared/CaughtError";
import { PageHeader } from "~/components/shared/PageHeader";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const vendors = await prisma.vendor.findMany({});
  return json({ vendors });
}

export default function TicketIndex() {
  const { vendors } = useLoaderData<typeof loader>();

  return (
    <main className="flex flex-col">
      <PageHeader
        title="Vendors"
        actionText="New Vendor"
        actionIcon={<IconPlus size={18} />}
        href="/admin/vendors/new"
      />
      <ul className="flex max-w-md flex-col gap-4">
        {vendors.map((vendor) => {
          return (
            <li
              className="rounded-md border border-gray-300 bg-white p-4"
              key={vendor.id}
            >
              <div className="grid grid-cols-6 items-center">
                <h3 className="col-span-3 font-medium">{vendor.name}</h3>
                <p className="col-span-2 text-sm leading-6 text-gray-500">
                  {vendor.isActive ? "Active" : "Inactive"}
                </p>
                <ButtonLink
                  className="col-span-1"
                  to={`/admin/vendors/${vendor.id}`}
                >
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
