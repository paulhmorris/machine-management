import type { Password, User, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/utils/db.server";

export type { User } from "@prisma/client";

export function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export function getUserWithCampusRole(id: User["id"]) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      campusUserRole: true,
    },
  });
}

export async function createUser(
  email: User["email"],
  password: string,
  role: UserRole = "USER"
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      role,
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function resetUserPassword({
  userId,
  password,
}: {
  userId: User["id"];
  password: string;
}) {
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.update({
    where: { id: userId },
    data: {
      password: { update: { hash } },
    },
  });
}

export async function setupUserPassword({
  userId,
  password,
}: {
  userId: User["id"];
  password: string;
}) {
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.update({
    where: { id: userId },
    data: {
      password: {
        create: { hash },
      },
    },
  });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
