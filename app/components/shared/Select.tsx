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
          "mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 sm:text-sm",
          props.className
        )}
      >
        {children}
      </select>
    </div>
  );
}
