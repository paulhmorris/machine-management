import type { ComponentPropsWithoutRef } from "react";

interface CheckboxProps extends ComponentPropsWithoutRef<"input"> {
  id: string;
  name: string;
  label: string;
}

export function Checkbox({ id, name, label, ...props }: CheckboxProps) {
  return (
    <div className="relative inline-flex items-start">
      <div className="flex h-5 items-center">
        <input
          {...props}
          id={id}
          name={name}
          type="checkbox"
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-cyan-600 transition duration-75 focus:ring-gray-200"
        />
      </div>
      <div className="ml-3">
        <label htmlFor={id} className="cursor-pointer font-medium">
          {label}
        </label>
      </div>
    </div>
  );
}
