import { redirect } from "@remix-run/node";
import { getUserById } from "~/models/user.server";
import { getUserId, logout } from "~/utils/session.server";

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireAdmin(request: Request) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  if (user) {
    if (user.role === "ADMIN") {
      return user;
    }
  }

  throw await logout(request);
}
