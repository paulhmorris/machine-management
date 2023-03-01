import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";

const newLocationSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
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
  const result = newLocationSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      { type: "error", message: "Error creating machine" }
    );
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
  const transition = useTransition();
  const busy =
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");

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
