import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";

const newVendorSchema = z.object({
  name: z.string(),
  tripCharge: z.coerce.number(),
  hourlyRate: z.coerce.number(),
  campusId: z.string().cuid(),
});

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  const campuses = await prisma.campus.findMany();

  return json({ campuses });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = newVendorSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      { type: "error", message: "Error creating machine" }
    );
  }
  const { name, campusId, hourlyRate, tripCharge } = result.data;
  const vendor = await prisma.vendor.create({
    data: {
      name,
      hourlyRate,
      tripCharge,
      campuses: {
        connect: { id: campusId },
      },
    },
  });
  return redirectWithToast(`/admin/vendors/${vendor.id}`, session, {
    message: "Vendor created successfully",
    type: "success",
  });
}

export default function NewVendor() {
  const { campuses } = useLoaderData<typeof loader>();
  const transition = useTransition();
  const busy =
    transition.state === "submitting" || transition.state === "loading";

  return (
    <>
      <h1>New Vendor</h1>
      <Form className="mt-4 space-y-4 sm:max-w-[16rem]" method="post">
        <Input label="Vendor Name" name="name" required />
        <Input
          label="Trip Charge"
          name="tripCharge"
          type="number"
          isCurrency
          required
        />
        <Input
          label="Hourly Rate"
          name="hourlyRate"
          type="number"
          isCurrency
          required
        />
        <Select label="Campus" name="campusId" defaultValue="" required>
          <option value="" disabled>
            Select campus
          </option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={busy}>
          {busy && <Spinner />}
          {busy ? "Creating..." : "Create Vendor"}
        </Button>
      </Form>
    </>
  );
}
