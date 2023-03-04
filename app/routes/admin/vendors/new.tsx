import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Checkbox } from "~/components/shared/Checkbox";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { getAllCampuses } from "~/models/campus.server";
import { newVendorSchema } from "~/schemas/vendorSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  return json({ campuses: await getAllCampuses() });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const formData = await request.formData();
  const form = Object.fromEntries(formData);
  // @ts-expect-error - This is required to get multiple selected checkbox values to be an array
  form.campusIds = formData.getAll("campusIds");

  const result = newVendorSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      { type: "error", message: "Error creating vendor" }
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
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");

  return (
    <>
      <h1>New Vendor</h1>
      <Form className="mt-4 space-y-4 sm:max-w-[18rem]" method="post">
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
        <fieldset>
          <legend className="text-sm font-medium text-gray-500">
            Select the campuses this vendor serves
          </legend>
          <ul className="mt-1 grid gap-1">
            {campuses.map((campus) => (
              <Checkbox
                key={campus.id}
                id={campus.id}
                name="campusId"
                value={campus.id}
                label={campus.name}
              />
            ))}
          </ul>
        </fieldset>
        <Button type="submit" disabled={busy}>
          {busy && <Spinner className="mr-2" />}
          {busy ? "Creating..." : "Create Vendor"}
        </Button>
      </Form>
    </>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
