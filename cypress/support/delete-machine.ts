import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { installGlobals } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

installGlobals();

async function deleteMachine(publicId: string) {
  if (!publicId) {
    throw new Error("Machine ID required for deletion");
  }

  try {
    await prisma.ticketEvent.deleteMany({
      where: { comments: "Test Comment" },
    });
    await prisma.ticket.deleteMany({ where: { notes: "Test Comment" } });
    await prisma.machine.deleteMany({
      where: { serialNumber: "Test Serial Number" },
    });
    await prisma.pocket.deleteMany({ where: { description: "Test Pocket" } });
    await prisma.location.deleteMany({ where: { name: "Test Location" } });
    await prisma.campus.deleteMany({ where: { name: "Test Campus" } });
    await prisma.machineType.delete({ where: { name: "Test Type" } });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
      console.log("Machine not found, so no need to delete");
    } else {
      console.log(error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteMachine(process.argv[2]);
