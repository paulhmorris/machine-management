import type { Location } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getLocationById(id: Location["id"]) {
  return prisma.location.findUnique({ where: { id } });
}

export function getAllLocations() {
  return prisma.location.findMany();
}
