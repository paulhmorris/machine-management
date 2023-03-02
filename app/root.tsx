import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "@remix-run/react";
import { Notifications } from "~/components/shared/Notifications";
import { getGlobalToast } from "~/utils/toast.server";

import styles from "~/tailwind.css";
import { getSession, getUser, sessionStorage } from "./utils/session.server";

// @ts-expect-error this doesn't like third object here, the type is not correct
export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "preconnect", href: "https://fonts.googleapis.com", as: "font" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "true",
      as: "font",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
    },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Machine Management",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  const toast = getGlobalToast(session);
  return json(
    { user: await getUser(request), toast },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    }
  );
}

export default function App() {
  const { toast } = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full font-dm">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Notifications serverToast={toast} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          <h1>Error</h1>
          <pre>{error.message}</pre>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body
        style={{
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <div>
          <h1>Error {caught.status}</h1>
          <pre>{caught.data}</pre>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
