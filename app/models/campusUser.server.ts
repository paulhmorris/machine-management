import type { Campus } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getCampusUsers(campusId: Campus["id"]) {
  return prisma.campusUser.findMany({
    where: { campusId },
    select: {
      role: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      user: { lastName: "asc" },
    },
  });
}
