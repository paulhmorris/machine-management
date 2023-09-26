import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import dayjs from "dayjs";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Checkbox } from "~/components/shared/Checkbox";
import { FieldError } from "~/components/shared/FieldError";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { getAllCampuses } from "~/models/campus.server";
import { updateVendorSchema } from "~/schemas/vendorSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, getBusyState, notFoundResponse } from "~/utils/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const { vendorId } = params;
  if (!vendorId) throw badRequest("Vendor ID is required");
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { campuses: true },
  });
  if (!vendor) throw notFoundResponse(`Vendor ${vendorId} not found`);
  return json({
    vendor,
    campuses: await getAllCampuses(),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const formData = await request.formData();
  const form = Object.fromEntries(formData);
  // @ts-expect-error - This is required to get multiple selected checkbox values to be an array
  form.campusIds = formData.getAll("campusIds");

  const result = updateVendorSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 }, session, {
      type: "error",
      message: "Error saving vendor",
    });
  }
  const { id, name, campusIds, hourlyRate, tripCharge } = result.data;
  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      name,
      hourlyRate,
      tripCharge,
      campuses: {
        connect: campusIds.map((id) => ({ id })),
      },
    },
  });
  return redirectWithToast(`/admin/vendors/${vendor.id}`, session, {
    message: "Vendor saved successfully",
    type: "success",
  });
}

export default function Vendor() {
  const { campuses, vendor } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = getBusyState(navigation);

  return (
    <>
      <h1>{vendor.name}</h1>
      <p className="mt-0.5 text-sm text-gray-400">Last updated {dayjs(vendor.updatedAt).format("M/D/YYYY h:mm a")}</p>
      <Form className="mt-4 space-y-4 sm:max-w-[20rem]" method="post">
        <input type="hidden" name="id" value={vendor.id} />
        <Input label="Vendor Name" name="name" defaultValue={vendor.name} errors={actionData?.errors?.name} required />
        <Input
          label="Trip Charge"
          name="tripCharge"
          type="number"
          defaultValue={vendor.tripCharge}
          errors={actionData?.errors?.tripCharge}
          isCurrency
          required
        />
        <Input
          label="Hourly Rate"
          name="hourlyRate"
          type="number"
          defaultValue={vendor.hourlyRate}
          errors={actionData?.errors?.hourlyRate}
          isCurrency
          required
        />
        <fieldset>
          <legend className="text-sm font-medium text-gray-700">Select the campuses this vendor serves</legend>
          <ul className="mt-1 grid gap-1">
            {campuses.map((campus) => (
              <Checkbox
                key={campus.id}
                id={campus.id}
                name="campusIds"
                value={campus.id}
                label={campus.name}
                defaultChecked={vendor.campuses.some((c) => c.id === campus.id)}
              />
            ))}
          </ul>
          <FieldError name="campusIds" errors={actionData?.errors?.campusIds} />
        </fieldset>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={busy}>
            {busy && <Spinner className="mr-2" />}
            {busy ? "Saving..." : "Save Vendor"}
          </Button>
          <Button variant="ghost" type="reset" disabled={busy}>
            Reset
          </Button>
        </div>
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
