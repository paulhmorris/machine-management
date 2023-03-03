import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { getAllCampuses } from "~/models/campus.server";
import { updateUserSchema } from "~/schemas/userSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, notFoundResponse } from "~/utils/utils";

export async function loader({ params, request }: LoaderArgs) {
  await requireAdmin(request);
  const { userId } = params;
  if (!userId) throw badRequest("User ID is required");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { campusUserRole: true },
  });
  if (!user) throw notFoundResponse("User not found");
  return json({
    user,
    campuses: await getAllCampuses(),
  });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = updateUserSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      { type: "error", message: "Error creating user" }
    );
  }
  const { userId, email, firstName, lastName, role, campusRole, campusId } =
    result.data;
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      email,
      role,
      campusUserRole: campusRole
        ? {
            upsert: {
              update: { campusId },
              create: {
                campus: { connect: { id: campusId } },
                role: campusRole,
              },
            },
          }
        : undefined,
    },
  });
  return redirectWithToast(`/admin/users/${user.id}`, session, {
    message: "User saved successfully",
    type: "success",
  });
}

export default function NewUser() {
  const { user, campuses } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const transition = useTransition();
  const busy =
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");

  return (
    <>
      <h1>
        {user.firstName || user.lastName ? (
          <>
            {user.firstName ?? ""} {user.lastName ?? ""}
          </>
        ) : (
          <>{user.email}</>
        )}
      </h1>
      <fetcher.Form method="post" action="/admin/users/send-password-reset">
        <input type="hidden" name="userId" value={user.id} />
        <Button
          type="submit"
          variant="secondary"
          disabled={busy}
          className="mt-2"
        >
          {busy && <Spinner className="mr-2" />}
          {busy ? "Sending..." : "Send Password Reset"}
        </Button>
      </fetcher.Form>
      <Form className="mt-4 sm:max-w-[16rem]" method="post">
        <input type="hidden" name="userId" value={user.id} />
        <div className="space-y-4">
          <Input
            label="Email"
            name="email"
            defaultValue={user.email}
            required
          />
          <Input
            label="First Name"
            name="firstName"
            defaultValue={user.firstName ?? ""}
          />
          <Input
            label="Last Name"
            name="lastName"
            defaultValue={user.lastName ?? ""}
          />
          <Select
            label="Permissions"
            name="role"
            defaultValue={user.role}
            required
          >
            <option value="ADMIN">Admin</option>
            <option value="USER">Vendor/Attendant</option>
          </Select>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <fieldset>
            <legend className="text-sm font-medium text-gray-500">
              Assign this user to a campus
            </legend>
            <div className="mt-2 space-y-2">
              <Select
                label="Campus"
                name="campusId"
                defaultValue={user.campusUserRole?.campusId ?? ""}
              >
                <option value="" disabled>
                  Select campus
                </option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Role"
                name="campusRole"
                defaultValue={user.campusUserRole?.role ?? ""}
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value="ATTENDANT">Attendant</option>
                <option value="CAMPUS_TECH">Campus Tech</option>
                <option value="MACHINE_TECH">Machine Tech</option>
              </Select>
            </div>
          </fieldset>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button type="submit" disabled={busy}>
            {busy && <Spinner className="mr-2" />}
            {busy ? "Saving..." : "Save User"}
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
