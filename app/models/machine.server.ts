import type { Machine } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getMachineForReport(machineId: Machine["id"]) {
  return prisma.machine.findUnique({
    where: { publicId: machineId.toUpperCase() },
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
}

export async function getErrorTypesForReport() {
  const errorTypes = await prisma.machineErrorType.findMany();
  return errorTypes.filter((type) => type.id !== 7 && type.id !== 8);
}
