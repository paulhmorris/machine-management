import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Select } from "~/components/shared/Select";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const vendors = await prisma.vendor.findMany({
    where: { isActive: true },
  });
  const campuses = await prisma.campus.findMany({ include: { vendors: true } });
  return json({ vendors, campuses });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const vendorId = form.get("vendorId");
  const campusId = form.get("campusId");
  invariant(typeof vendorId === "string", "Expected vendorId");
  invariant(typeof campusId === "string", "Expected campusId");

  const invoice = await prisma.invoice.create({
    data: { vendorId, campusId },
  });
  return redirect(`/admin/invoices/${invoice.id}`);
}

export default function NewInvoice() {
  const { vendors, campuses } = useLoaderData<typeof loader>();
  const [selectedVendor, setSelectedVendor] = useState<string>("");

  return (
    <main>
      <h1>New Invoice</h1>
      <Form className="mt-8 space-y-4" method="post">
        <Select
          label="Vendors"
          className="w-min"
          name="vendorId"
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a vendor
          </option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </Select>
        <Select
          disabled={selectedVendor === ""}
          label="Campuses"
          className="w-min"
          name="campusId"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select a campus
          </option>
          {campuses
            .filter((c) => c.vendors.some((v) => v.id === selectedVendor))
            .map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
        </Select>
        <Button>Start Invoice</Button>
      </Form>
    </main>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
