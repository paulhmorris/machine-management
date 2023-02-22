import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import { Input } from "~/components/shared/Input";

import { verifyLogin } from "~/models/user.server";
import { loginSchema } from "~/schemas/login";
import { createUserSession, getUserId } from "~/utils/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const form = Object.fromEntries(await request.formData());
  try {
    const { email, password, redirectTo, remember } = loginSchema.parse(form);
    const user = await verifyLogin(email, password);
    if (!user) {
      return json(
        { errors: { email: "Invalid email or password", password: null } },
        { status: 400 }
      );
    }
    return createUserSession({
      request,
      userId: user.id,
      remember: remember === "on" ? true : false,
      redirectTo,
    });
  } catch (error) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }
}

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    console.log(actionData);
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <h1 className="mb-8 text-center">Go ahead, log in.</h1>
      <Form
        method="post"
        className="mx-auto w-full max-w-sm space-y-6"
        noValidate
      >
        <Input
          label="Username"
          name="email"
          type="email"
          ref={emailRef}
          error={actionData?.errors?.email}
          required
          autoComplete="username"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          ref={passwordRef}
          error={actionData?.errors?.password}
          required
          autoComplete="current-password"
        />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-cyan-700 px-4 py-2.5 text-base font-medium text-white shadow-sm transition duration-75 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
        >
          Log in
        </button>
      </Form>
    </>
  );
}
