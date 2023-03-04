import type { Campus } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getCampusById(id: Campus["id"]) {
  return prisma.campus.findUnique({ where: { id } });
}

export function getAllCampuses() {
  return prisma.campus.findMany();
}
