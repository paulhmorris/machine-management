import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import {
  expirePasswordReset,
  getPasswordResetByToken,
} from "~/models/passwordReset.server";
import { getUserById, setupUserPassword } from "~/models/user.server";
import { passwordSetupSchema } from "~/schemas/passwordSchemas";
import { getSearchParam } from "~/utils/utils";

export async function loader({ request }: LoaderArgs) {
  const token = getSearchParam("token", request);
  if (!token) return redirect("/login");
  const reset = await getPasswordResetByToken({ token });
  if (!reset) return redirect("/login");
  if (reset.expiresAt < new Date()) return redirect("/login?tokenExpired=true");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const tokenParam = getSearchParam("token", request);
  const form = Object.fromEntries(await request.formData());
  const result = passwordSetupSchema.safeParse(form);
  if (!result.success) {
    return json(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const { password, token } = result.data;
  // Make sure it's not expired again
  const reset = await getPasswordResetByToken({ token });
  if (!reset || reset.expiresAt < new Date() || token !== tokenParam) {
    return redirect("/login");
  }

  const userFromToken = await getUserById(reset.userId);
  if (!userFromToken) return redirect("/login");

  await setupUserPassword({ userId: userFromToken.id, password });
  await expirePasswordReset({ token });
  return redirect("/login?passwordReset=true");
}

export default function NewPassword() {
  const [searchParams] = useSearchParams();
  const transition = useTransition();
  const busy =
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");
  const actionData = useActionData<typeof action>();

  return (
    <>
      <h1 className="mb-8 text-center">Create a password.</h1>
      <Form method="post" className="mx-auto w-full max-w-sm space-y-4">
        <input
          type="hidden"
          name="token"
          value={searchParams.get("token") ?? ""}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          errors={actionData?.errors.password}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label="Confirm Password"
          name="confirmation"
          type="password"
          errors={actionData?.errors.confirmation}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Spinner className="mr-2" />}
          {busy ? "Creating..." : "Create Password"}
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
