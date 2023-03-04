import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import dayjs from "dayjs";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { Textarea } from "~/components/shared/Textarea";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { getAllCampuses } from "~/models/campus.server";
import { updateLocationSchema } from "~/schemas/locationSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, getBusyState, notFoundResponse } from "~/utils/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { locationId } = params;
  if (!locationId) throw badRequest("Location ID is required");
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      description: true,
      campus: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  if (!location) throw notFoundResponse("Location not found");

  return json({
    location,
    campuses: await getAllCampuses(),
  });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = updateLocationSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      { type: "error", message: "Error creating machine" }
    );
  }
  const { id, name, description, campusId } = result.data;
  const location = await prisma.location.update({
    where: { id },
    data: { name, description, campusId },
  });
  return redirectWithToast(`/admin/locations/${location.id}`, session, {
    message: "Location updated successfully.",
    type: "success",
  });
}

export default function Location() {
  const { campuses, location } = useLoaderData<typeof loader>();

  const transition = useTransition();
  const busy = getBusyState(transition);

  return (
    <>
      <h1>{location.name}</h1>
      <p className="mt-0.5 text-sm text-gray-500">
        Last updated {dayjs(location.updatedAt).format("M/D/YYYY h:mm A")}
      </p>
      <Form className="mt-4 space-y-4 sm:max-w-[16rem]" method="post">
        <input type="hidden" name="id" value={location.id} />
        <Input
          label="Name"
          name="name"
          placeholder="Ross hall"
          description="This will be displayed to users"
          defaultValue={location.name}
          required
        />
        <Textarea
          label="Description"
          name="description"
          placeholder="A building on campus."
          defaultValue={location.description ?? ""}
          maxLength={255}
        />
        <Select
          label="Campus"
          name="campusId"
          defaultValue={location.campus.id}
          required
        >
          <option value="" disabled>
            Select campus
          </option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </Select>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={busy}>
            {busy && <Spinner className="mr-2" />}
            {busy ? "Saving..." : "Save Location"}
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
