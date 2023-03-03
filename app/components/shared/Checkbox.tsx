import type { ComponentPropsWithoutRef } from "react";
import { classNames } from "~/utils/utils";

interface CheckboxProps extends ComponentPropsWithoutRef<"input"> {
  id: string;
  name: string;
  label: string;
}

export function Checkbox({ id, name, label, ...props }: CheckboxProps) {
  return (
    <div className="relative flex items-center">
      <div className="flex h-5 items-center">
        <input
          {...props}
          id={id}
          name={name}
          type="checkbox"
          className={classNames(
            "h-4 w-4 cursor-pointer rounded border-gray-300 text-cyan-600 transition duration-75 focus:ring-cyan-600/50",
            props.className
          )}
        />
      </div>
      <div className="ml-3">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </label>
      </div>
    </div>
  );
}
