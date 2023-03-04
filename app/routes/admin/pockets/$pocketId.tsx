import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { Textarea } from "~/components/shared/Textarea";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { getAllCampuses } from "~/models/campus.server";
import { getAllLocations } from "~/models/location.server";
import { updatePocketSchema } from "~/schemas/pocketSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, notFoundResponse } from "~/utils/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { pocketId } = params;
  if (!pocketId) throw badRequest("Pocket ID is required");
  const pocket = await prisma.pocket.findUnique({
    where: { id: pocketId },
    select: {
      id: true,
      floor: true,
      position: true,
      updatedAt: true,
      description: true,
      location: {
        select: {
          id: true,
          campus: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
  if (!pocket) throw notFoundResponse("Machine not found");

  return json({
    pocket,
    campuses: await getAllCampuses(),
    locations: await getAllLocations(),
  });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = updatePocketSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      { type: "error", message: "Error saving pocket" }
    );
  }
  const { id, description, locationId, floor, position } = result.data;
  const pocket = await prisma.pocket.update({
    where: { id },
    data: {
      floor,
      description,
      position,
      location: { connect: { id: locationId } },
    },
  });
  return redirectWithToast(`/admin/pockets/${pocket.id}`, session, {
    message: "Pocket updated successfully.",
    type: "success",
  });
}

export default function Machine() {
  const { pocket, campuses, locations } = useLoaderData<typeof loader>();
  const [campusId, setCampusId] = useState<string>(pocket.location.campus.id);

  const transition = useTransition();
  const busy =
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");

  return (
    <>
      <h1>
        Pocket: {pocket.floor && `Floor ${pocket.floor}`}
        {pocket.position && ` - position ${pocket.position}`}
      </h1>
      <p className="mt-0.5 text-sm text-gray-500">
        Last updated {dayjs(pocket.updatedAt).format("M/D/YYYY h:mm A")}
      </p>
      <Form
        onReset={(e) => {
          setCampusId(pocket.location.campus.id);
          e.currentTarget.reset();
        }}
        className="mt-4 space-y-4 sm:max-w-[16rem]"
        method="post"
      >
        <input type="hidden" name="id" value={pocket.id} />
        <Input
          label="Floor"
          name="floor"
          placeholder="1"
          maxLength={12}
          defaultValue={pocket.floor ?? ""}
        />
        <Input
          label="Position"
          name="position"
          placeholder="1"
          type="number"
          defaultValue={pocket.position ?? 1}
        />
        <Textarea
          label="Description"
          name="description"
          placeholder="It's really cute."
          defaultValue={pocket.description ?? ""}
          maxLength={255}
        />
        <Select
          label="Campus"
          name="campusId"
          defaultValue={pocket.location.campus.id}
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
          defaultValue={pocket.location.id}
          disabled={campusId === ""}
          required
        >
          <option value="" disabled>
            Select location
          </option>
          {campusId &&
            locations
              .filter((l) => l.campusId === campusId)
              .map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
        </Select>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={busy}>
            {busy && <Spinner className="mr-2" />}
            {busy ? "Saving..." : "Save Pocket"}
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
