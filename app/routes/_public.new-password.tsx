import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { expirePasswordReset, getPasswordResetByToken } from "~/models/passwordReset.server";
import { getUserById, resetUserPassword, verifyLogin } from "~/models/user.server";
import { passwordResetSchema } from "~/schemas/passwordSchemas";
import { getBusyState, getSearchParam } from "~/utils/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const token = getSearchParam("token", request);
  if (!token) return redirect("/login");
  const reset = await getPasswordResetByToken({ token });
  if (!reset) return redirect("/login");
  if (reset.expiresAt < new Date()) return redirect("/login?tokenExpired=true");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const tokenParam = getSearchParam("token", request);
  const form = Object.fromEntries(await request.formData());
  const result = passwordResetSchema.safeParse(form);
  if (!result.success) {
    return json({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 });
  }
  const { oldPassword, newPassword, token } = result.data;
  // Make sure it's not expired again
  const reset = await getPasswordResetByToken({ token });
  if (!reset) return redirect("/login");
  if (reset.expiresAt < new Date()) return redirect("/login");
  if (token !== tokenParam) return redirect("/login");

  const userFromToken = await getUserById(reset.userId);
  if (!userFromToken) return redirect("/login");
  const user = await verifyLogin(userFromToken.email, oldPassword);
  if (!user) return redirect("/login");

  await resetUserPassword({ userId: user.id, password: newPassword });
  await expirePasswordReset({ token });

  return redirect("/login?passwordReset=true");
}

export default function NewPassword() {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const busy = getBusyState(navigation);
  const actionData = useActionData<typeof action>();

  return (
    <>
      <h1 className="mb-8 text-center">Set a new password.</h1>
      <Form method="post" className="mx-auto w-full max-w-sm space-y-4">
        <input type="hidden" name="token" value={searchParams.get("token") ?? ""} />
        <Input
          label="Old password"
          name="oldPassword"
          type="password"
          errors={actionData?.errors.oldPassword}
          autoComplete="current-password"
          minLength={8}
          required
        />
        <Input
          label="New Password"
          name="newPassword"
          type="password"
          errors={actionData?.errors.newPassword}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label="Confirm New Password"
          name="confirmation"
          type="password"
          errors={actionData?.errors.confirmation}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Spinner className="mr-2" />}
          {busy ? "Resetting..." : "Reset Password"}
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
