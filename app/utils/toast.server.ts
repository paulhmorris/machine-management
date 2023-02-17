import type { Session } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { sessionStorage } from "~/utils/session.server";

export type ServerToast = {
  message: string;
  type: "success" | "error" | "warning" | "info";
};

export function setGlobalToast(session: Session, toast: ServerToast) {
  session.flash("globalMessage", toast);
}

export function getGlobalToast(session: Session): ServerToast | null {
  return session.get("globalMessage") || null;
}

export async function redirectWithToast(
  url: string,
  session: Session,
  toast: ServerToast
) {
  setGlobalToast(session, toast);
  return redirect(url, {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
}
