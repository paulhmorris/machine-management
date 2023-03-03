import type { ComponentPropsWithRef, ReactNode } from "react";
import { forwardRef } from "react";
import { FieldError } from "~/components/shared/FieldErrors";
import { classNames } from "~/utils/utils";

interface Props extends ComponentPropsWithRef<"select"> {
  label: string;
  name: string;
  children: ReactNode;
  description?: string;
  errors?: string[] | undefined;
  hideLabel?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  (
    { label, name, children, description, errors, hideLabel = false, ...props },
    ref
  ) => {
    return (
      <div>
        <div>
          <label
            htmlFor={name}
            className={classNames(
              hideLabel && "sr-only",
              "inline-block whitespace-nowrap text-sm font-medium text-gray-700"
            )}
          >
            {label}
          </label>
          {props.required ? (
            <span id="additional-label" className="text-sm">
              *
            </span>
          ) : (
            <span id="additional-label" className="ml-1 text-xs text-gray-400">
              (optional)
            </span>
          )}
        </div>
        <select
          {...props}
          ref={ref}
          id={name}
          name={name}
          aria-describedby={`${name}-error ${name}-description additional-label`}
          aria-invalid={errors ? true : props["aria-invalid"]}
          className={classNames(
            "mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base shadow-sm focus:border-cyan-700 focus:ring focus:ring-cyan-600 focus:ring-opacity-25 disabled:pointer-events-none disabled:opacity-50 sm:text-sm",
            props.className
          )}
        >
          {children}
        </select>
        {errors ? (
          <FieldError name={name} errors={errors} />
        ) : (
          description && (
            <p
              className="mt-2 text-sm text-gray-500"
              id={`${name}-description`}
            >
              {description}
            </p>
          )
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
