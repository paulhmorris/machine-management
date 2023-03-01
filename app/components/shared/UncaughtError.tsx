export function UncaughtError({ error }: { error: Error }) {
  return (
    <div className="grid min-h-full place-items-center rounded-lg border border-red-500 bg-red-500/5 p-6">
      <div className="space-y-2 text-center">
        <h1>Error</h1>
        <p className="font-mono font-bold text-red-700">{error.message}</p>
        <div>
          <p id="stack" className="text-left font-medium">
            Stack:
          </p>
          <pre
            aria-describedby="stack"
            className="whitespace-pre-wrap rounded-lg bg-gray-800 p-6 text-left text-xs text-gray-50"
          >
            {error.stack}
          </pre>
        </div>
      </div>
    </div>
  );
}
