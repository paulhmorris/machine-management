import type { Prisma } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function createVendor(data: Prisma.VendorCreateInput) {
  return prisma.vendor.create({ data });
}
