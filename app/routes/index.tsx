import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

export async function action({ request }: ActionArgs) {
  const form = await request.formData();
  const machineId = form.get("machineId");
  invariant(typeof machineId === "string", "Expected machineId");

  return redirect(`/report/${machineId}`);
}

export default function Index() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center p-2 sm:p-6">
      <h1 className="mt-12 text-center">Hey there!</h1>
      <p className="mt-4 text-center">
        If you need to report an issue, please <strong>scan the QR code</strong>{" "}
        on the machine. You can also enter the machine number below.
      </p>
      <form action="/?index" method="post" className="mt-8 space-y-2">
        <div>
          <label
            htmlFor="machineId"
            className="block text-sm font-medium text-gray-700"
          >
            Machine Number
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="machineId"
              id="machineId"
              className="block w-full rounded-md border-gray-300 shadow-sm transition placeholder:text-gray-300 invalid:border-red-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              required
              placeholder="XYZ"
              autoFocus
            />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-cyan-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
        >
          Make a report
        </button>
      </form>
    </main>
  );
}
