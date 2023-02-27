import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUserId } from "~/utils/session.server";

import { Button } from "~/components/shared/Button";
import { CustomLink } from "~/components/shared/CustomLink";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { createUser, getUserByEmail } from "~/models/user.server";
import { joinSchema } from "~/schemas/loginSchemas";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const form = Object.fromEntries(await request.formData());
  const result = joinSchema.safeParse(form);
  if (!result.success) {
    return json(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const { email, password, redirectTo } = result.data;
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: ["A user already exists with this email"],
          password: [],
        },
      },
      { status: 400 }
    );
  }

  const user = await createUser(email, password, "ADMIN");

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
}

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const transition = useTransition();
  const busy =
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <h1 className="text-center">Go ahead, join.</h1>

      <Form method="post" className="mx-auto mt-8 w-full max-w-sm space-y-4">
        <Input
          ref={emailRef}
          label="Email"
          autoFocus={true}
          name="email"
          type="email"
          autoComplete="email"
          errors={actionData?.errors?.email}
          required
        />
        <Input
          ref={emailRef}
          label="Password"
          autoFocus={true}
          name="password"
          type="password"
          autoComplete="new-password"
          errors={actionData?.errors?.password}
          required
        />

        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Button type="submit" disabled={busy}>
          {busy && <Spinner className="mr-2" />}
          {busy ? "Creating Account..." : "Create Account"}
        </Button>
        <div className="flex items-center justify-center">
          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <CustomLink
              to={{
                pathname: "/login",
                search: searchParams.toString(),
              }}
            >
              Log in
            </CustomLink>
          </div>
        </div>
      </Form>
    </>
  );
}
