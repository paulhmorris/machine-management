import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { classNames } from "~/utils/utils";

interface Props extends ComponentPropsWithoutRef<"select"> {
  label: string;
  name: string;
  children: ReactNode;
}

export function Select({ label, name, children, ...props }: Props) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <select
        {...props}
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
