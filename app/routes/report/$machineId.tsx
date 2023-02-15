import type { LoaderArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";
import { prisma } from "~/utils/db.server";

export async function loader({ params }: LoaderArgs) {
  const { machineId } = params;
  invariant(machineId, "Expected machineId");

  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    include: {
      pocket: {
        include: {
          location: {
            include: {
              campus: true,
            },
          },
        },
      },
      type: true,
    },
  });
  if (!machine) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ machine });
}

export default function MachineReport() {
  const { machine } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>{machine.friendlyNumber}</h1>
      <p>Location: {machine.pocket.location.name}</p>
    </div>
  );
}
