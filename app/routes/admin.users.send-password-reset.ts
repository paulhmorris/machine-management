import type { ActionFunctionArgs } from "@remix-run/node";
import { generatePasswordReset, getCurrentPasswordReset } from "~/models/passwordReset.server";
import { getUserById } from "~/models/user.server";
import { sendPasswordResetSchema } from "~/schemas/passwordSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast } from "~/utils/toast.server";
import { notFoundResponse } from "~/utils/utils";

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = sendPasswordResetSchema.safeParse(form);

  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 }, session, {
      type: "error",
      message: "Error resetting password",
    });
  }

  const { userId } = result.data;
  const user = await getUserById(userId);
  if (!user) throw notFoundResponse("User not found");

  const existingReset = await getCurrentPasswordReset({ userId });
  if (existingReset) {
    return jsonWithToast(
      {
        message: "A password reset is already pending for this email",
      },
      { status: 400 },
      session,
      {
        type: "error",
        message: "A password reset is already pending for this email",
      }
    );
  }

  const reset = await generatePasswordReset({ email: user.email });
  // await sendPasswordResetEmail({ email: user.email, token: reset.token });

  return jsonWithToast({ message: "Password reset email sent" }, { status: 200 }, session, {
    type: "success",
    message: "Password reset email sent",
  });
}
