import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { CustomLink } from "~/components/shared/CustomLink";

import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { verifyLogin } from "~/models/user.server";
import { loginSchema } from "~/schemas/loginSchemas";
import { createUserSession, getUserId } from "~/utils/session.server";
import { getBusyState } from "~/utils/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const form = Object.fromEntries(await request.formData());
  const result = loginSchema.safeParse(form);

  if (!result.success) {
    return json({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 });
  }

  const { email, password, redirectTo, remember } = result.data;
  const user = await verifyLogin(email, password);
  if (!user) {
    return json({ errors: { email: ["Invalid email or password"], password: [] } }, { status: 400 });
  }
  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on" ? true : false,
    redirectTo,
  });
}

export const meta: MetaFunction = () => {
  return [{ title: "Login" }];
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";
  const passwordWasReset = searchParams.get("passwordReset");
  const tokenExpired = searchParams.get("tokenExpired");
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = getBusyState(navigation);

  useEffect(() => {
    if (passwordWasReset) {
      toast.success("Your password was successfully reset 🎉");
    }
    if (tokenExpired) {
      toast.error("Your password reset token has expired. Please request another.");
    }
  }, [passwordWasReset, tokenExpired]);

  return (
    <>
      <h1 className="text-center">Go ahead, log in.</h1>
      <Form method="post" className="mx-auto mt-8 w-full max-w-sm space-y-4">
        <Input
          label="Username"
          name="email"
          type="email"
          autoComplete="username"
          errors={actionData?.errors.email}
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          errors={actionData?.errors.password}
          required
        />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <CustomLink to="/reset-password" className="text-right text-sm">
          Forgot password
        </CustomLink>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Spinner className="mr-2" />}
          {busy ? "Logging In..." : "Log In"}
        </Button>
      </Form>
    </>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
