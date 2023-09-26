import type { Machine, Prisma } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getMachineForReport(publicId: Machine["publicId"]) {
  return prisma.machine.findUnique({
    where: { publicId: publicId.toUpperCase() },
    select: {
      type: true,
      publicId: true,
      pocket: {
        select: {
          location: {
            select: {
              name: true,
              campus: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export async function getErrorTypesForReport() {
  const errorTypes = await prisma.machineErrorType.findMany();
  return errorTypes.filter((type) => type.id !== 7 && type.id !== 8);
}

export function getErrorType(id: number) {
  return prisma.machineErrorType.findUnique({
    where: { id },
    select: { name: true },
  });
}

export function getMachineForRequestEmail(publicId: Machine["id"]) {
  return prisma.machine.findUnique({
    where: { publicId: publicId.toUpperCase() },
    select: {
      publicId: true,
      serialNumber: true,
      type: { select: { name: true } },
      pocket: {
        select: {
          floor: true,
          position: true,
          location: {
            select: {
              name: true,
              campus: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });
}

export function getMachinesForTable({ where = {} }: { where?: Prisma.MachineWhereInput }) {
  return prisma.machine.findMany({
    where,
    include: {
      type: true,
      pocket: {
        include: {
          location: {
            include: {
              campus: true,
            },
          },
        },
      },
    },
  });
}

export function getAllMachineTypes() {
  return prisma.machineType.findMany();
}
