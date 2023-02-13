import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  chargeTypes,
  errorTypes,
  machineTypes,
  ticketStatuses,
} from "~/settings";

const prisma = new PrismaClient();

async function seed() {
  const email = "tmfd@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("password", 10);

  const campus = await prisma.campus.create({
    data: {
      name: "TCU",
    },
  });
  await prisma.location.createMany({
    data: [
      { name: faker.word.noun(), campusId: campus.id },
      { name: faker.word.noun(), campusId: campus.id },
      { name: faker.word.noun(), campusId: campus.id },
      { name: faker.word.noun(), campusId: campus.id },
    ],
  });
  const vendor = await prisma.vendor.create({
    data: {
      name: "TCU",
      tripCharge: 100,
      hourlyCharge: 50,
      campuses: {
        connect: {
          id: campus.id,
        },
      },
    },
  });
  await prisma.user.create({
    data: {
      firstName: "Trae",
      lastName: "Drose",
      vendor: {
        connect: {
          id: vendor.id,
        },
      },
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.machineErrorType.createMany({
    data: errorTypes.map((type) => {
      return { name: type };
    }),
  });

  await prisma.ticketStatus.createMany({
    data: ticketStatuses.map((status) => {
      return { name: status };
    }),
  });

  await prisma.chargeType.createMany({
    data: chargeTypes.map((status) => {
      return { name: status };
    }),
  });

  await prisma.machineType.createMany({
    data: machineTypes.map((type) => {
      return { name: type };
    }),
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
