import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  chargeTypes,
  errorTypes,
  machineTypes,
  ticketStatuses,
} from "~/utils/constants";
const prisma = new PrismaClient();

async function seed() {
  const email = "tmfd@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("password", 10);

  // Campus, locations, pockets, and vendor
  const campus = await prisma.campus.create({
    data: {
      name: "TCU",
    },
  });
  const vendor = await prisma.vendor.create({
    data: {
      name: "AAdvantage Repair",
      tripCharge: 100,
      hourlyRate: 50,
      campuses: {
        connect: {
          id: campus.id,
        },
      },
    },
  });
  for (let i = 0; i < 50; i++) {
    await prisma.location.create({
      data: {
        name: faker.address.city(),
        campusId: campus.id,
      },
    });
    await prisma.invoice.create({
      data: {
        total: faker.datatype.float({ min: 0, max: 1000 }),
        vendorId: vendor.id,
        campusId: campus.id,
        vendorInvoiceNumber: `INV-${faker.random.numeric(6)}`,
        invoicedOn: faker.date.past(),
        paidOn: faker.date.past(),
        submittedOn: faker.date.past(),
      },
    });
  }

  const locations = await prisma.location.findMany();
  await prisma.pocket.createMany({
    data: [
      {
        floor: faker.random.numeric(),
        description: faker.random.words(10),
        locationId: faker.helpers.arrayElement(locations).id,
      },
      {
        floor: faker.random.numeric(),
        description: faker.random.words(10),
        locationId: faker.helpers.arrayElement(locations).id,
      },
      {
        floor: faker.random.numeric(),
        description: faker.random.words(10),
        locationId: faker.helpers.arrayElement(locations).id,
      },
      {
        floor: faker.random.numeric(),
        description: faker.random.words(10),
        locationId: faker.helpers.arrayElement(locations).id,
      },
      {
        floor: faker.random.numeric(),
        description: faker.random.words(10),
        locationId: faker.helpers.arrayElement(locations).id,
      },
      {
        floor: faker.random.numeric(),
        description: faker.random.words(10),
        locationId: faker.helpers.arrayElement(locations).id,
      },
      {
        floor: faker.random.numeric(),
        description: faker.random.words(10),
        locationId: faker.helpers.arrayElement(locations).id,
      },
      {
        floor: faker.random.numeric(),
        description: faker.random.words(10),
        locationId: faker.helpers.arrayElement(locations).id,
      },
      {
        floor: faker.random.numeric(),
        description: faker.random.words(10),
        locationId: faker.helpers.arrayElement(locations).id,
      },
      {
        floor: faker.random.numeric(),
        description: faker.random.words(10),
        locationId: faker.helpers.arrayElement(locations).id,
      },
    ],
  });

  // Create types
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
  // Machines
  const pockets = await prisma.pocket.findMany();
  for (let i = 0; i < 1000; i++) {
    await prisma.machine.create({
      data: {
        publicId: faker.random.alphaNumeric(6).toUpperCase(),
        pocketId: faker.helpers.arrayElement(pockets).id,
        description: faker.random.words(4),
        serialNumber: faker.random.alphaNumeric(16),
        machineTypeId: 1,
      },
    });
  }

  for (let i = 0; i < 50; i++) {
    // create user
    const user = await prisma.user.create({
      data: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        role: faker.helpers.arrayElement(["USER", "VENDOR"]),
        email: faker.internet.email(),
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    });
    await prisma.campusUser.create({
      data: {
        userId: user.id,
        campusId: campus.id,
        role: faker.helpers.arrayElement([
          "ATTENDANT",
          "CAMPUS_TECH",
          "MACHINE_TECH",
        ]),
      },
    });
    await prisma.part.create({
      data: {
        name: faker.random.words(2),
        partNumber: faker.random.alphaNumeric(6),
        standardCost: faker.datatype.float({ min: 0, max: 1000 }),
      },
    });
  }
  const admin = await prisma.user.create({
    data: {
      firstName: "Trae",
      lastName: "Drose",
      role: "ADMIN",
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

  const machines = await prisma.machine.findMany();
  const statuses = await prisma.ticketStatus.findMany();
  const machineErrorTypes = await prisma.machineErrorType.findMany();
  for (let i = 0; i < 100; i++) {
    await prisma.ticket.create({
      data: {
        notes: faker.random.words(10),
        machineId: faker.helpers.arrayElement(machines).id,
        ticketStatusId: faker.helpers.arrayElement(statuses).id,
        machineErrorTypeId: faker.helpers.arrayElement(machineErrorTypes).id,
        reporterEmail: faker.internet.email(),
        assignedToUserId: admin.id,
        reportedOn: faker.date.past(),
        updatedAt: faker.date.past(),
      },
    });
  }
  const tickets = await prisma.ticket.findMany();
  const invoices = await prisma.invoice.findMany();
  for (let i = 0; i < 500; i++) {
    const randomTicket = faker.helpers.arrayElement(tickets);
    await prisma.ticketEvent.create({
      data: {
        comments: faker.random.words(
          faker.datatype.number({ min: 10, max: 40 })
        ),
        ticketId: randomTicket.id,
        ticketStatusId: faker.helpers.arrayElement(statuses).id,
        assignedToUserId: admin.id,
        createdByUserId: admin.id,
        timestamp: faker.date.past(),
      },
    });
    const randomInvoice = faker.helpers.arrayElement(invoices);
    await prisma.charge.create({
      data: {
        actualCost: faker.datatype.number({ min: 10, max: 100 }),
        typeId: faker.datatype.number({ min: 1, max: 3 }),
        ticketId: randomTicket.id,
        createdAt: faker.date.past(),
        invoiceId: randomInvoice.id,
      },
    });
  }

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
