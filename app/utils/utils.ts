import type { Charge, ChargeType } from "@prisma/client";
import { json } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return route?.data;
}

function isUser(user: any): user is User {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function badRequest<Data = unknown>(
  data: Data,
  init?: Omit<ResponseInit, "status">
) {
  return json<Data>(data, { ...init, status: 400 });
}

export function getSearchParam(param: string, request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get(param);
}
export function getAllSearchParams(param: string, request: Request) {
  const url = new URL(request.url);
  return url.searchParams.getAll(param);
}

export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(" ");
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calculateTotalByType(
  charges: Array<Charge & { type: ChargeType }>,
  typeId: Charge["typeId"]
) {
  return charges.reduce((acc, charge) => {
    if (charge.typeId === typeId) {
      return acc + charge.actualCost;
    }
    return acc;
  }, 0);
}
