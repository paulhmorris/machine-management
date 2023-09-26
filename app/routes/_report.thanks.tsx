import { useSearchParams } from "@remix-run/react";

export default function Thanks() {
  const [searchParams] = useSearchParams();
  return (
    <div className="space-y-3 text-center">
      <h1>Thanks!</h1>
      <p>We&apos;ll get on this right away.</p>
      {searchParams.get("providedEmail") && (
        <p>
          Since you provided an email, we&apos;ll let you know as soon as
          it&apos;s been fixed.
        </p>
      )}
    </div>
  );
}
