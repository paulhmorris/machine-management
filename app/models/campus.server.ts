import { prisma } from "~/utils/db.server";

export function getAllCampuses() {
  return prisma.campus.findMany();
}
