import type { ComponentPropsWithRef } from "react";
import { forwardRef } from "react";
import { classNames } from "~/utils/utils";

interface TextareaProps extends ComponentPropsWithRef<"textarea"> {
  name: string;
  label: string;
  resizeable?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ name, label, resizeable = true, ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="mt-1">
          <textarea
            {...props}
            rows={props.rows ?? 4}
            name={name}
            id={name}
            className={classNames(
              "block w-full rounded-md border-gray-300 shadow-sm placeholder:text-gray-300 focus:border-cyan-700 focus:ring focus:ring-cyan-600 focus:ring-opacity-25 disabled:pointer-events-none disabled:opacity-50 sm:text-sm",
              resizeable ? "resize-y" : "resize-none"
            )}
            defaultValue={""}
          />
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
