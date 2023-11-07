import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
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

export const meta: MetaFunction = () => {
  return [{ title: "Machine Management" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const toast = getGlobalToast(session);
  const user = await getUser(request);
  return json(
    { user, toast },
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
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full text-gray-600">
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
          <pre>{error?.message}</pre>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
export function CatchBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
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
            <h1>Error {error.status}</h1>
            <pre>{error.data}</pre>
          </div>
          <Scripts />
        </body>
      </html>
    );
  }
}
