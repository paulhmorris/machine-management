import type { Session, TypedResponse } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { sessionStorage } from "~/utils/session.server";

export type ServerToast = {
  message: string;
  type: "success" | "error";
};

export function setGlobalToast(session: Session, toast: ServerToast) {
  session.flash("globalMessage", toast);
}

export function getGlobalToast(session: Session): ServerToast | null {
  return (session.get("globalMessage") as ServerToast) || null;
}

export async function redirectWithToast(
  url: string,
  session: Session,
  toast: ServerToast,
  init?: ResponseInit
) {
  setGlobalToast(session, toast);
  return redirect(url, {
    ...init,
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
}

export async function jsonWithToast<Data>(
  data: Data,
  init: ResponseInit = {},
  session: Session,
  toast: ServerToast
): Promise<TypedResponse<Data>> {
  setGlobalToast(session, toast);
  return json(data, {
    ...init,
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
}
