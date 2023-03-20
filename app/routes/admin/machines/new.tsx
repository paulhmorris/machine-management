import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Radio } from "~/components/shared/Radio";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { getAllCampuses } from "~/models/campus.server";
import { getAllLocations } from "~/models/location.server";
import { getAllMachineTypes } from "~/models/machine.server";
import { getAllPockets } from "~/models/pocket.server";
import { newMachineSchema } from "~/schemas/machineSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { getBusyState } from "~/utils/utils";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  return json({
    campuses: await getAllCampuses(),
    locations: await getAllLocations(),
    pockets: await getAllPockets(),
    machineTypes: await getAllMachineTypes(),
  });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = newMachineSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 }, session, {
      type: "error",
      message: "Error creating machine",
    });
  }
  const { publicId, serialNumber, description, machineTypeId, pocketId } = result.data;
  const machine = await prisma.machine.create({
    data: {
      publicId,
      serialNumber,
      description,
      type: { connect: { id: machineTypeId } },
      pocket: { connect: { id: pocketId } },
    },
  });
  return redirectWithToast(`/admin/machines/${machine.id}`, session, {
    message: "Machine created successfully",
    type: "success",
  });
}

export default function NewMachine() {
  const { campuses, locations, pockets, machineTypes } = useLoaderData<typeof loader>();
  const transition = useTransition();
  const busy = getBusyState(transition);
  const [campusId, setCampusId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");

  return (
    <>
      <h1>New Machine</h1>
      <Form className="mt-4 space-y-4 sm:max-w-[16rem]" method="post">
        <Input label="Machine Id" name="publicId" placeholder="ABC123" description="This must be unique." required />
        <Input
          label="Serial Number"
          name="serialNumber"
          placeholder="SN-1234567890"
          description="Scan barcode to autofill this field"
        />
        <Input
          label="Model Number"
          name="modelNumber"
          placeholder="MAH6500AWW"
          description="Scan barcode to autofill this field"
        />
        <Input label="Description" name="description" placeholder="Maytag Neptune" maxLength={255} />
        <ul className="mt-1 flex gap-4">
          {machineTypes.map((type) => (
            <Radio required label={type.name} name="machineTypeId" key={type.id} value={type.id} />
          ))}
        </ul>
        <Select label="Campus" name="campusId" defaultValue="" onChange={(e) => setCampusId(e.target.value)} required>
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
          onChange={(e) => setLocationId(e.target.value)}
          disabled={campusId === ""}
          required
        >
          <option value="" disabled>
            Select location
          </option>
          {campusId &&
            locations
              .filter((l) => l.campusId === campusId && pockets.some((p) => p.locationId === l.id))
              .map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
        </Select>
        <Select label="Pocket" name="pocketId" defaultValue="" disabled={locationId === ""} required>
          <option value="" disabled>
            Select pocket
          </option>
          {locationId &&
            pockets
              .filter((p) => p.locationId === locationId)
              .map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.floor && `Floor ${loc.floor}`}
                  {loc.position && ` - position ${loc.position}`}
                </option>
              ))}
        </Select>
        <Button type="submit" disabled={busy}>
          {busy && <Spinner className="mr-2" />}
          {busy ? "Creating..." : "Create Machine"}
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
