import { installGlobals } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

installGlobals();

async function createMachine(machineId: string) {
  if (!machineId) {
    throw new Error("Machine ID required");
  }

  const machine = await prisma.machine.create({
    data: {
      publicId: machineId,
      serialNumber: "Test Serial Number",
      type: {
        create: { name: "Test Type" },
      },
      pocket: {
        create: {
          description: "Test Pocket",
          location: {
            create: {
              name: "Test Location",
              campus: {
                create: {
                  name: "Test Campus",
                },
              },
            },
          },
        },
      },
    },
  });

  console.log(
    `
    <machine>
      ${machine.publicId}
    </machine>
    `.trim()
  );
}

createMachine(process.argv[2]).catch((error) => console.error(error));
