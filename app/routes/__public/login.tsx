import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { Button } from "~/components/shared/Button";

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
  const result = loginSchema.safeParse(form);

  if (!result.success) {
    return json(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const { email, password, redirectTo, remember } = result.data;
  const user = await verifyLogin(email, password);
  if (!user) {
    return json(
      { errors: { email: ["Invalid email or password"], password: [] } },
      { status: 400 }
    );
  }
  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
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

  return (
    <>
      <h1 className="mb-8 text-center">Go ahead, log in.</h1>
      <Form method="post" className="mx-auto w-full max-w-sm space-y-4">
        <Input
          label="Username"
          name="email"
          type="email"
          errors={actionData?.errors.email}
          required
          autoComplete="username"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          errors={actionData?.errors.password}
          required
          autoComplete="current-password"
        />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Button type="submit" className="w-full">
          Log in
        </Button>
      </Form>
    </>
  );
}
