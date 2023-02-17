import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import toast from "react-hot-toast";
import { Button } from "~/components/shared/Button";
import { requireVendorOrAdmin } from "~/utils/auth.server";
import type { ServerToast } from "~/utils/toast.server";

export async function loader({ request }: LoaderArgs) {
  await requireVendorOrAdmin(request);
  return json({});
}

export default function AdminIndex() {
  function triggerToast(toastMessage: ServerToast) {
    switch (toastMessage.type) {
      case "success":
        toast.success(toastMessage.message);
        break;
      case "error":
        toast.error(toastMessage.message);
        break;
    }
  }
  return (
    <main>
      <h1>Admin Index</h1>
      <div className="flex w-min flex-col gap-3">
        <Button
          onClick={() =>
            triggerToast({ message: "I'm a success toast!", type: "success" })
          }
        >
          Success
        </Button>
        <Button
          onClick={() =>
            triggerToast({ message: "I'm an error toast!", type: "error" })
          }
        >
          Error
        </Button>
      </div>
    </main>
  );
}
