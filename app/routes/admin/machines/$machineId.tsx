import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import { Radio } from "~/components/shared/Radio";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { Textarea } from "~/components/shared/Textarea";
import { getAllCampuses } from "~/models/campus.server";
import { getAllLocations } from "~/models/location.server";
import { getAllMachineTypes } from "~/models/machine.server";
import { getAllPockets } from "~/models/pocket.server";
import { updateMachineSchema } from "~/schemas/machineSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, getBusyState, notFoundResponse } from "~/utils/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { machineId } = params;
  if (!machineId) throw badRequest("Machine ID is required");
  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    select: {
      id: true,
      updatedAt: true,
      machineTypeId: true,
      description: true,
      publicId: true,
      serialNumber: true,
      modelNumber: true,
      pocket: {
        select: {
          floor: true,
          id: true,
          location: {
            select: {
              id: true,
              name: true,
              campusId: true,
            },
          },
        },
      },
    },
  });
  if (!machine) throw notFoundResponse(`Machine ${machineId} not found`);

  return json({
    machine,
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
  const result = updateMachineSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 }, session, {
      type: "error",
      message: "Error creating machine",
    });
  }
  const { id, publicId, serialNumber, description, machineTypeId, pocketId } = result.data;
  const machine = await prisma.machine.update({
    where: { id },
    data: {
      publicId,
      serialNumber,
      description,
      type: { connect: { id: machineTypeId } },
      pocket: { connect: { id: pocketId } },
    },
  });
  return redirectWithToast(`/admin/machines/${machine.id}`, session, {
    message: "Machine updated successfully.",
    type: "success",
  });
}

export default function Machine() {
  const { machine, campuses, locations, pockets, machineTypes } = useLoaderData<typeof loader>();
  const machineCampusId = machine.pocket.location.campusId;
  const machineLocationId = machine.pocket.location.id;
  const machinePocketId = machine.pocket.id;
  const [campusId, setCampusId] = useState<string>(machineCampusId);
  const [locationId, setLocationId] = useState<string>(machineLocationId);

  const transition = useTransition();
  const busy = getBusyState(transition);

  return (
    <>
      <h1>Machine {machine.publicId}</h1>
      <p className="mt-0.5 text-sm text-gray-500">Last updated {dayjs(machine.updatedAt).format("M/D/YYYY h:mm A")}</p>
      <Form
        onReset={(e) => {
          setCampusId(machineCampusId);
          setLocationId(machineLocationId);
          e.currentTarget.reset();
        }}
        className="mt-4 space-y-4 sm:max-w-[16rem]"
        method="post"
      >
        <input type="hidden" name="id" value={machine.id} />
        <Input
          label="Machine Id"
          name="publicId"
          placeholder="ABC123"
          description="This will be displayed to users"
          defaultValue={machine.publicId}
          required
        />
        <Input
          label="Serial Number"
          name="serialNumber"
          placeholder="SN-1234567890"
          description="Scan barcode to autofill this field"
          defaultValue={machine.serialNumber ?? ""}
        />
        <Input
          label="Model Number"
          name="modelNumber"
          description="Scan barcode to autofill this field"
          defaultValue={machine.modelNumber ?? ""}
        />
        <Textarea
          label="Description"
          name="description"
          placeholder="It's really cute."
          defaultValue={machine.description ?? ""}
          maxLength={255}
        />
        <fieldset>
          <legend className="text-sm font-medium text-gray-700">Machine Type</legend>
          <ul className="mt-1 flex gap-4">
            {machineTypes.map((type) => (
              <Radio
                required
                label={type.name}
                name="machineTypeId"
                key={type.id}
                value={type.id}
                defaultChecked={type.id === machine.machineTypeId}
              />
            ))}
          </ul>
        </fieldset>
        <Select
          label="Campus"
          name="campusId"
          defaultValue={machineCampusId}
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
          defaultValue={machineLocationId}
          onChange={(e) => setLocationId(e.target.value)}
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
        <Select label="Pocket" name="pocketId" defaultValue={machinePocketId} disabled={locationId === ""} required>
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
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={busy}>
            {busy && <Spinner className="mr-2" />}
            {busy ? "Saving..." : "Save Machine"}
          </Button>
          <Button variant="ghost" type="reset" disabled={busy}>
            Reset
          </Button>
        </div>
      </Form>
    </>
  );
}
