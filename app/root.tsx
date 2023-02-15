import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Toaster } from "react-hot-toast";

import styles from "./styles/tailwind.css";
import { getUser } from "./utils/session.server";

// @ts-expect-error this doesn't like third object here, the type is not correct
export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles, as: "style" },
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
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  return (
    <html lang="en" className="h-full font-dm">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Toaster position="top-right" />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
