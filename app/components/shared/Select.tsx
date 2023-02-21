import type { ComponentPropsWithRef, ReactNode } from "react";
import { forwardRef } from "react";
import { classNames } from "~/utils/utils";

interface Props extends ComponentPropsWithRef<"select"> {
  label: string;
  name: string;
  children: ReactNode;
  hideLabel?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, name, children, hideLabel = false, ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={name}
          className={hideLabel ? "sr-only" : "block text-sm font-medium"}
        >
          {label}
          {props.required ? (
            "*"
          ) : (
            <span className="ml-1 text-sm text-gray-400">(optional)</span>
          )}
        </label>
        <select
          {...props}
          ref={ref}
          id={name}
          name={name}
          className={classNames(
            "mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-cyan-700 focus:ring focus:ring-cyan-600 focus:ring-opacity-25 disabled:pointer-events-none disabled:opacity-50 sm:text-sm",
            props.className
          )}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
