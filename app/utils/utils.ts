import type { Charge } from "@prisma/client";
import { json } from "@remix-run/node";
import { Navigation, useMatches } from "@remix-run/react";
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
export function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(() => matchingRoutes.find((route) => route.id === id), [matchingRoutes, id]);
  return route?.data as Record<string, unknown>;
}

export function isUser(user: unknown): user is User {
  return typeof user !== "undefined" && user !== null && typeof user === "object" && "email" in user;
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

export function badRequest<Data = unknown>(data: Data, init?: Omit<ResponseInit, "status">) {
  return json<Data>(data, { ...init, status: 400 });
}

export function notFoundResponse(msg: string, init?: Omit<ResponseInit, "status">) {
  return new Response(msg, { ...init, status: 404 });
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

export function calculateTotalByType(charges: Array<Pick<Charge, "actualCost" | "typeId">>, typeId: Charge["typeId"]) {
  return charges.reduce((acc, charge) => {
    if (charge.typeId === typeId) {
      return acc + charge.actualCost;
    }
    return acc;
  }, 0);
}

export function getBusyState(navigation: Navigation) {
  // navigation.type === "actionSubmission"
  const isActionSubmission = navigation.state === "submitting";

  // navigation.type === "actionReload"
  const isActionReload =
    navigation.state === "loading" &&
    navigation.formMethod != null &&
    navigation.formMethod != "GET" &&
    // We had a submission navigation and are loading the submitted location
    navigation.formAction === navigation.location.pathname;

  // navigation.type === "actionRedirect"
  const isActionRedirect =
    navigation.state === "loading" &&
    navigation.formMethod != null &&
    navigation.formMethod != "GET" &&
    // We had a submission navigation and are now navigating to different location
    navigation.formAction !== navigation.location.pathname;

  return isActionSubmission || isActionReload || isActionRedirect;
}

export function actionIsAvailable(actionName: string, statusId: number) {
  // Always allow other assignments
  const canClose = [1, 2, 3, 5, 6, 7, 8, 9, 10];
  const canReassign = [1, 2, 3, 5, 6, 7, 9, 10];
  const canReopen = 4;

  switch (actionName) {
    case "close":
      return canClose.includes(statusId);
    case "attendant":
      return canReassign.includes(statusId);
    case "machineTech":
    case "campusTech":
      return canReassign.includes(statusId);
    case "reopen":
      return statusId === canReopen;
    case "note":
      return true;
    default:
      return false;
  }
}
