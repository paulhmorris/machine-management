import type { Part } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getPartById(id: Part["id"]) {
  return prisma.part.findUnique({ where: { id } });
}

export function getAllParts() {
  return prisma.part.findMany();
}
