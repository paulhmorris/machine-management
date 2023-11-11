import type { ComponentPropsWithRef } from "react";
import { forwardRef } from "react";
import { FieldError } from "~/components/shared/FieldError";
import { cn } from "~/utils/utils";

interface InputProps extends ComponentPropsWithRef<"input"> {
  name: string;
  label: string;
  description?: string;
  hideLabel?: boolean;
  hideHelperText?: boolean;
  errors?: string[] | null[] | undefined;
  isCurrency?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ name, label, description, errors, hideLabel, hideHelperText, isCurrency, ...props }, ref) => {
    return (
      <div>
        <div>
          <label
            htmlFor={name}
            className={cn(hideLabel && "sr-only", "inline-block whitespace-nowrap text-sm font-medium text-gray-700")}
          >
            {label}
          </label>
          {props.required ? (
            <span id="additional-label" className="text-sm">
              <span className="sr-only">Required</span>*
            </span>
          ) : (
            <span id="additional-label" className="ml-1 text-xs text-gray-400">
              (optional)
            </span>
          )}
        </div>
        <div className={hideLabel ? "relative -mt-0.5" : "relative mt-1"}>
          {isCurrency && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </span>
          )}
          <input
            {...props}
            ref={ref ?? null}
            id={name}
            name={name}
            type={props.type ?? "text"}
            step={isCurrency ? "0.01" : props.step}
            aria-invalid={errors ? true : props["aria-invalid"]}
            aria-describedby={`${name}-error ${name}-description additional-label`}
            className={cn(
              isCurrency && "pl-7",
              "mt-1 block w-full rounded-md border-gray-300 shadow-sm transition duration-100 placeholder:text-gray-300 hover:border-cyan-700 focus:border-cyan-700 focus:ring focus:ring-cyan-600 focus:ring-opacity-25 disabled:pointer-events-none disabled:opacity-50 sm:text-sm",
              props.className
            )}
          />
        </div>
        {errors ? (
          <FieldError name={name} errors={errors} />
        ) : (
          description && (
            <p className="mt-2 pl-1 text-xs text-gray-500" id={`${name}-description`}>
              {description}
            </p>
          )
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
