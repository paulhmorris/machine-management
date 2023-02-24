import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { verifyLogin } from "~/models/user.server";
import { prisma } from "~/utils/db.server";
import { getSearchParam } from "~/utils/utils";

const passwordResetSchema = z
  .object({
    token: z.string(),
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmation: z.string().min(8),
  })
  .superRefine(({ newPassword, confirmation }, ctx) => {
    if (newPassword !== confirmation) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords must match",
        path: ["confirmation"],
      });
    }
  });

export async function loader({ request }: LoaderArgs) {
  const token = getSearchParam("token", request);
  if (!token) return redirect("/login");
  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset) return redirect("/login");
  if (reset.expiresAt < new Date()) return redirect("/login?tokenExpired=true");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const tokenParam = getSearchParam("token", request);
  const form = Object.fromEntries(await request.formData());
  const result = passwordResetSchema.safeParse(form);
  if (!result.success) {
    return json(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }
  const { oldPassword, newPassword, token } = result.data;
  // Make sure it's not expired again
  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset) return redirect("/login");
  if (reset.expiresAt < new Date()) return redirect("/login");
  if (token !== tokenParam) return redirect("/login");

  const userFromToken = await prisma.user.findUnique({
    where: { id: reset.userId },
  });
  if (!userFromToken) return redirect("/login");
  const user = await verifyLogin(userFromToken.email, oldPassword);
  if (!user) return redirect("/login");
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: {
        update: { hash },
      },
      passwordResets: {
        updateMany: {
          where: { token: tokenParam },
          data: {
            expiresAt: new Date(0),
            usedAt: new Date(),
          },
        },
      },
    },
  });
  return redirect("/login?passwordReset=true");
}

export default function NewPassword() {
  const [searchParams] = useSearchParams();
  const transition = useTransition();
  const busy =
    transition.state === "submitting" || transition.state === "loading";
  const actionData = useActionData<typeof action>();

  return (
    <>
      <h1 className="mb-8 text-center">Set a new password.</h1>
      <Form method="post" className="mx-auto w-full max-w-sm space-y-4">
        <input
          type="hidden"
          name="token"
          value={searchParams.get("token") ?? ""}
        />
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
