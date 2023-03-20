import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import dayjs from "dayjs";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { getCampusById } from "~/models/campus.server";
import { updateCampusSchema } from "~/schemas/campusSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, getBusyState, notFoundResponse } from "~/utils/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { campusId } = params;
  if (!campusId) throw badRequest("Campus ID is required");
  const campus = await getCampusById(campusId);
  if (!campus) throw notFoundResponse(`Campus ${campusId} not found`);
  return json({ campus });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const formData = await request.formData();
  const form = Object.fromEntries(formData);

  const result = updateCampusSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 }, session, {
      type: "error",
      message: "Error saving campus",
    });
  }
  const campus = await prisma.campus.update({
    where: { id: result.data.id },
    data: { ...result.data },
  });
  return redirectWithToast(`/admin/campuses/${campus.id}`, session, {
    message: "Campus saved successfully",
    type: "success",
  });
}

export default function Campus() {
  const { campus } = useLoaderData<typeof loader>();
  const transition = useTransition();
  const busy = getBusyState(transition);

  return (
    <>
      <h1>{campus.name}</h1>
      <p className="mt-0.5 text-sm text-gray-400">Last updated {dayjs(campus.updatedAt).format("M/D/YYYY h:mm a")}</p>
      <Form className="mt-4 space-y-4 sm:max-w-[20rem]" method="post">
        <input type="hidden" name="id" value={campus.id} />
        <Input label="Name" name="name" defaultValue={campus.name} required />
        <Input
          label="Monthly Management Fee"
          name="monthlyFee"
          defaultValue={campus.monthlyFee}
          description="A line item for this amount will be automatically added to monthly invoices"
          isCurrency
          required
        />
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={busy}>
            {busy && <Spinner className="mr-2" />}
            {busy ? "Saving..." : "Save Campus"}
          </Button>
          <Button variant="ghost" type="reset" disabled={busy}>
            Reset
          </Button>
        </div>
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
