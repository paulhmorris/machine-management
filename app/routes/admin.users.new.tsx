import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Checkbox } from "~/components/shared/Checkbox";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { getAllCampuses } from "~/models/campus.server";
import { generatePasswordReset } from "~/models/passwordReset.server";
import { newUserSchema } from "~/schemas/userSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { getBusyState, useUser } from "~/utils/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return json({ campuses: await getAllCampuses() });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const form = Object.fromEntries(await request.formData());
  const result = newUserSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 }, session, {
      type: "error",
      message: "Error creating user",
    });
  }
  const { email, firstName, lastName, role, campusRole, campusId, sendEmail } = result.data;
  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      role,
      campusUserRole: campusRole
        ? {
            create: {
              role: campusRole,
              campus: { connect: { id: campusId } },
            },
          }
        : undefined,
    },
  });

  if (sendEmail) {
    const { token } = await generatePasswordReset({ email });
    // await sendPasswordSetupEmail({ email, token });
  }

  return redirectWithToast(`/admin/users/`, session, {
    message: "User created successfully",
    type: "success",
  });
}

export default function NewUser() {
  const { campuses } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const user = useUser();
  const [campusId, setCampusId] = useState<string>("");
  const [campusRole, setCampusRole] = useState<string>("");
  const busy = getBusyState(navigation);

  function handleCampusChange(e: ChangeEvent<HTMLSelectElement>) {
    setCampusRole("");
    setCampusId(e.target.value);
  }

  return (
    <>
      <h1>New User</h1>
      <Form className="mt-4 sm:max-w-[20rem]" method="post">
        <div className="space-y-4">
          <Input label="Email" name="email" required />
          <Input label="First Name" name="firstName" />
          <Input label="Last Name" name="lastName" />
          <Select
            label="Permissions"
            name="role"
            description="Admins can access the management site."
            defaultValue="USER"
            required
          >
            {user.role === "ADMIN" && <option value="ADMIN">Admin</option>}
            <option value="USER">Vendor/Attendant</option>
          </Select>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <fieldset>
            <legend className="text-sm font-medium text-gray-500">Assign this user to a campus</legend>
            <div className="mt-2 space-y-2">
              <Select label="Campus" name="campusId" value={campusId} onChange={handleCampusChange}>
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
        <div className="mt-4 border-t border-gray-200 pt-4">
          <Checkbox id="sendEmail" name="sendEmail" label="Send a password setup email" defaultChecked={true} />
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

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
