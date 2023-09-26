import type { ComponentPropsWithoutRef } from "react";

interface RadioProps extends ComponentPropsWithoutRef<"input"> {
  name: string;
  label: string;
  description?: string;
  errors?: string[] | undefined;
}

export function Radio(props: RadioProps) {
  return (
    <div className="flex items-center">
      <input
        {...props}
        id={props.value?.toString()}
        name={props.name}
        type="radio"
        className="h-4 w-4 cursor-pointer border-gray-300 text-cyan-700 transition duration-75 focus:ring-cyan-700/25"
      />
      <label htmlFor={props.value?.toString()} className="ml-3 block cursor-pointer text-sm font-medium text-gray-700">
        {props.label}
      </label>
    </div>
  );
}
