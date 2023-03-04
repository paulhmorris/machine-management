import type { Pocket } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getPocketById(id: Pocket["id"]) {
  return prisma.pocket.findUnique({ where: { id } });
}

export function getAllPockets() {
  return prisma.pocket.findMany();
}
