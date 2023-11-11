export function FieldError({ errors, name }: { errors: string[] | null[] | undefined; name: string }) {
  if (!errors?.length) return null;

  return (
    <p className="whitespace-nowrap pl-1 pt-1 text-sm font-medium text-red-500" id={`${name}-error`} role="alert">
      {errors.map((error) => (
        <span key={error}>{error}</span>
      ))}
    </p>
  );
}
