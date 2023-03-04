import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useTransition } from "@remix-run/react";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { newCampusSchema } from "~/schemas/campusSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { getBusyState } from "~/utils/utils";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  return json({});
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = newCampusSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      { type: "error", message: "Error creating machine" }
    );
  }
  const { name } = result.data;
  const campus = await prisma.campus.create({
    data: { name },
  });
  return redirectWithToast(`/admin/campuses/${campus.id}`, session, {
    message: "Campus created successfully",
    type: "success",
  });
}

export default function NewCampus() {
  const transition = useTransition();
  const busy = getBusyState(transition);

  return (
    <>
      <h1>New Campus</h1>
      <Form className="mt-4 space-y-4 sm:max-w-[16rem]" method="post">
        <Input label="Name" name="name" required />
        <Button type="submit" disabled={busy}>
          {busy && <Spinner className="mr-2" />}
          {busy ? "Creating..." : "Create Campus"}
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
