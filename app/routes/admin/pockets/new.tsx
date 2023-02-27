import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";

const newPocketSchema = z.object({
  locationId: z.string().cuid(),
  floor: z.string().optional(),
  description: z.string().optional(),
  position: z.coerce.number().optional(),
});

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  const campuses = await prisma.campus.findMany();
  const locations = await prisma.location.findMany();
  return json({ campuses, locations });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = newPocketSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      { type: "error", message: "Error creating machine" }
    );
  }
  const { floor, position, locationId, description } = result.data;
  const pocket = await prisma.pocket.create({
    data: {
      floor,
      position,
      description,
      location: {
        connect: { id: locationId },
      },
    },
  });
  return redirectWithToast(`/admin/pockets/${pocket.id}`, session, {
    message: "Pocket created successfully",
    type: "success",
  });
}

export default function NewLocation() {
  const { campuses, locations } = useLoaderData<typeof loader>();
  const transition = useTransition();
  const busy =
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");
  const [campusId, setCampusId] = useState<string>("");

  return (
    <>
      <h1>New Pocket</h1>
      <Form className="mt-4 space-y-4 sm:max-w-[16rem]" method="post">
        <Input label="Floor" name="floor" />
        <Input label="Position" name="position" />
        <Input label="Description" name="description" />
        <Select
          label="Campus"
          name="campusId"
          defaultValue=""
          onChange={(e) => setCampusId(e.target.value)}
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
        <Select
          label="Location"
          name="locationId"
          defaultValue=""
          disabled={campusId === ""}
          required
        >
          <option value="" disabled>
            Select location
          </option>
          {campusId &&
            locations
              .filter((l) => l.campusId === campusId)
              .map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
        </Select>
        <Button type="submit" disabled={busy}>
          {busy && <Spinner className="mr-2" />}
          {busy ? "Creating..." : "Create Pocket"}
        </Button>
      </Form>
    </>
  );
}
