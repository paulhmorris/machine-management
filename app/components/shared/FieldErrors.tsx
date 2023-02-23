export function FieldError({
  errors,
  name,
}: {
  errors: string[] | undefined;
  name: string;
}) {
  if (!errors?.length) return null;

  return (
    <p
      className="whitespace-nowrap pt-1 pl-1 text-sm font-medium text-red-500"
      id={`${name}-error`}
      role="alert"
    >
      {errors.map((error) => (
        <span key={error}>{error}</span>
      ))}
    </p>
  );
}
