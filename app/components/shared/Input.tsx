import type { ComponentPropsWithRef } from "react";
import { forwardRef } from "react";
import type { z } from "zod";
import { classNames } from "~/utils/utils";

interface InputProps extends ComponentPropsWithRef<"input"> {
  name: string;
  label: string;
  hideLabel?: boolean;
  hideHelperText?: boolean;
  errors?: z.ZodError;
  isCurrency?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { name, label, errors, hideLabel, hideHelperText, isCurrency, ...props },
    ref
  ) => {
    return (
      <div>
        <label
          htmlFor={name}
          className={
            hideLabel
              ? "sr-only"
              : "block whitespace-nowrap font-medium text-gray-700 sm:text-sm"
          }
        >
          {label}
          {props.required
            ? "*"
            : !hideHelperText && (
                <span className="ml-1 text-sm text-gray-400">(optional)</span>
              )}
        </label>
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
            aria-describedby={`${name}-error`}
            className={classNames(
              isCurrency && "pl-7",
              "mt-1 block w-full rounded-md border-gray-300 shadow-sm transition duration-100 placeholder:text-gray-300 hover:border-cyan-700 focus:border-cyan-700 focus:ring focus:ring-cyan-600 focus:ring-opacity-25 disabled:pointer-events-none disabled:opacity-50 sm:text-sm",
              props.className
            )}
          />
          {/* <Error errors={errors} /> */}
          {errors && (
            <p
              className="whitespace-nowrap pt-1 pl-1 text-sm font-medium text-red-500"
              id={`${name}-error`}
              role="alert"
            >
              {errors.message}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
