import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { getAllCampuses } from "~/models/campus.server";
import { newLocationSchema } from "~/schemas/locationSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { getBusyState } from "~/utils/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const campuses = await getAllCampuses();

  return json({ campuses });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = newLocationSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 }, session, {
      type: "error",
      message: "Error creating machine",
    });
  }
  const { name, campusId, description } = result.data;
  const location = await prisma.location.create({
    data: {
      name,
      description,
      campus: {
        connect: { id: campusId },
      },
    },
  });
  return redirectWithToast(`/admin/locations/${location.id}`, session, {
    message: "Location created successfully",
    type: "success",
  });
}

export default function NewLocation() {
  const { campuses } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const busy = getBusyState(navigation);

  return (
    <>
      <h1>New Location</h1>
      <Form className="mt-4 space-y-4 sm:max-w-[16rem]" method="post">
        <Input label="Name" name="name" required />
        <Input label="Description" name="description" />
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
          {busy && <Spinner className="mr-2" />}
          {busy ? "Creating..." : "Create Location"}
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
