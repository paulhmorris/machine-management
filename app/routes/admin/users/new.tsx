import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";

const newUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["ADMIN", "USER"]),
  campusId: z.string().cuid(),
  campusRole: z.enum(["ATTENDANT", "MACHINE_TECH", "CAMPUS_TECH"]),
});

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  return json({
    campuses: await prisma.campus.findMany(),
  });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = newUserSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      { type: "error", message: "Error creating user" }
    );
  }
  const { email, firstName, lastName, role, campusRole, campusId } =
    result.data;
  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      role,
      campusUserRole: {
        create: { campusId, role: campusRole },
      },
    },
  });
  return redirectWithToast(`/admin/users/`, session, {
    message: "User created successfully",
    type: "success",
  });
}

export default function NewUser() {
  const { campuses } = useLoaderData<typeof loader>();
  const transition = useTransition();
  const busy =
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");

  return (
    <>
      <h1>New User</h1>
      <Form className="mt-4 sm:max-w-[16rem]" method="post">
        <div className="space-y-4">
          <Input label="Email" name="email" required />
          <Input label="First Name" name="firstName" />
          <Input label="Last Name" name="lastName" />
          <Select label="Permissions" name="role" required defaultValue="USER">
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
              <Select label="Campus" name="campusId" required>
                <option value="" disabled>
                  Select campus
                </option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </Select>
              <Select label="Role" name="campusRole" defaultValue="" required>
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
            {busy ? "Creating..." : "Create User"}
          </Button>
          <Button variant="ghost" type="reset" disabled={busy}>
            Reset
          </Button>
        </div>
      </Form>
    </>
  );
}
