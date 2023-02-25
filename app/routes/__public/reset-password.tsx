import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import crypto from "crypto";
import dayjs from "dayjs";
import { z } from "zod";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { getUserByEmail } from "~/models/user.server";
import { prisma } from "~/utils/db.server";

export async function action({ request }: ActionArgs) {
  const form = Object.fromEntries(await request.formData());
  const result = z.object({ email: z.string().email() }).safeParse(form);
  if (!result.success) {
    return json(
      { errors: result.error.flatten().fieldErrors, message: null },
      { status: 400 }
    );
  }
  const user = await getUserByEmail(result.data.email);
  if (!user) {
    return json({
      errors: { email: ["No user found with that email"] },
      message: null,
    });
  }
  const existingReset = await prisma.passwordReset.findFirst({
    where: { userId: user.id, expiresAt: { gte: new Date() } },
  });
  if (existingReset) {
    return json({
      errors: { email: ["A password reset is already pending for this email"] },
      message: null,
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordReset.create({
    data: {
      token,
      user: { connect: { id: user.id } },
      expiresAt: dayjs().add(15, "minute").toDate(),
    },
  });

  return json({
    message: "Thanks! Check your email for a password reset link.",
    errors: { email: [] },
  });
}

export default function ResetPassword() {
  const actionData = useActionData<typeof action>();
  const transition = useTransition();
  const busy =
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");

  return (
    <>
      <h1 className="mb-8 text-center">Reset your password.</h1>
      <Form method="post" className="mx-auto w-full max-w-sm space-y-4">
        <Input
          label="Username"
          name="email"
          type="email"
          errors={actionData?.errors.email}
          required
          autoComplete="username"
        />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Spinner className="mr-2" />}
          {busy ? "Generating Link..." : "Get Reset Link"}
        </Button>
        {actionData?.message && (
          <div className="relative mt-8 text-cyan-700" role="alert">
            <span className="block text-center text-sm font-medium">
              {actionData.message}
            </span>
          </div>
        )}
      </Form>
    </>
  );
}
