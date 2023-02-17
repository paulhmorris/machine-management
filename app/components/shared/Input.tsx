import type { ComponentPropsWithRef } from "react";
import { forwardRef } from "react";
import { classNames } from "~/utils/utils";

interface InputProps extends ComponentPropsWithRef<"input"> {
  name: string;
  label: string;
  hideLabel?: boolean;
  error?: string | null | undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ name, label, error, hideLabel, ...props }, ref) => {
    return (
      <div className="relative">
        <label
          htmlFor={name}
          className={
            hideLabel ? "sr-only" : "block text-sm font-medium text-gray-700"
          }
        >
          {label}
        </label>
        <div className={hideLabel ? "-mt-0.5" : "mt-1"}>
          <input
            {...props}
            ref={ref ?? null}
            id={name}
            name={name}
            type={props.type ?? "text"}
            aria-invalid={error ? true : undefined}
            aria-describedby={`${name}-error`}
            className={classNames(
              "mt-1 block w-full rounded-md border-gray-300 shadow-sm transition duration-75 placeholder:text-gray-300 focus:border-cyan-700 focus:ring focus:ring-cyan-600 focus:ring-opacity-25 disabled:pointer-events-none disabled:opacity-50 sm:text-sm",
              props.className
            )}
          />
          {error && (
            <p
              className="pt-1 pl-1 text-sm font-medium text-red-700"
              id={`${name}-error`}
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
