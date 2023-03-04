import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { ChangeEvent } from "react";
import { useState } from "react";
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
import {
  badRequest,
  getBusyState,
  notFoundResponse,
  useUser,
} from "~/utils/utils";

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
    },
    include: {
      campusUserRole: true,
    },
  });
  // If they deselected the campus and campus role, but the user has one then delete it
  if (user.campusUserRole && !campusId && !campusRole) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        campusUserRole: {
          delete: true,
        },
      },
    });
  }
  // If they selected a campus and campus role, but the user doesn't have one then create it
  if (!user.campusUserRole && campusId && campusRole) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        campusUserRole: {
          create: {
            campusId,
            role: campusRole,
          },
        },
      },
    });
  }

  return redirectWithToast(`/admin/users/${user.id}`, session, {
    message: "User saved successfully",
    type: "success",
  });
}

export default function NewUser() {
  const { user, campuses } = useLoaderData<typeof loader>();
  const currentUser = useUser();
  const fetcher = useFetcher();
  const transition = useTransition();
  const [campusId, setCampusId] = useState<string>(
    user.campusUserRole?.campusId ?? ""
  );
  const [campusRole, setCampusRole] = useState<string>(
    user.campusUserRole?.role ?? ""
  );
  const busy = getBusyState(transition);
  const fetcherBusy =
    fetcher.state === "submitting" ||
    ((fetcher.type === "actionRedirect" || fetcher.type === "actionReload") &&
      fetcher.state === "loading");

  function handleCampusChange(e: ChangeEvent<HTMLSelectElement>) {
    setCampusRole("");
    setCampusId(e.target.value);
  }

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
          disabled={fetcherBusy}
          className="mt-2"
        >
          {fetcherBusy && <Spinner className="mr-2" variant="blue" />}
          {fetcherBusy ? "Sending..." : "Send Password Reset"}
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
          {currentUser.role === "ADMIN" && (
            <Select
              label="Permissions"
              name="role"
              defaultValue={user.role}
              required
            >
              <option value="ADMIN">Admin</option>
              <option value="USER">Vendor/Attendant</option>
            </Select>
          )}
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
                value={campusId}
                onChange={handleCampusChange}
              >
                <option value="">None</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Role"
                name="campusRole"
                value={campusRole}
                onChange={(e) => setCampusRole(e.target.value)}
                disabled={campusId === ""}
              >
                <option value="">None</option>
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
