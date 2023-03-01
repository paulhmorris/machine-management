import { useCatch } from "@remix-run/react";

export function CaughtError() {
  const caught = useCatch();
  return (
    <div className="grid place-items-center rounded-lg border border-red-500 bg-red-500/5 p-6">
      <div className="space-y-2 text-center">
        <h1>{caught.status === 404 ? "Not Found" : "Something went wrong"}</h1>
        <p className="font-bold text-red-700">Status code {caught.status}</p>
        <p className="text-base leading-7 text-gray-600">{caught.data}</p>
      </div>
    </div>
  );
}
