import type { ComponentPropsWithRef } from "react";
import { forwardRef } from "react";
import { FieldError } from "~/components/shared/FieldError";
import { classNames } from "~/utils/utils";

interface TextareaProps extends ComponentPropsWithRef<"textarea"> {
  name: string;
  label: string;
  description?: string;
  resizeable?: boolean;
  hideLabel?: boolean;
  errors?: string[] | undefined;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ name, label, description, resizeable = true, hideLabel, errors, ...props }, ref) => {
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
              <span className="sr-only">Required</span>*
            </span>
          ) : (
            <span id="additional-label" className="ml-1 text-xs text-gray-400">
              (optional)
            </span>
          )}
        </div>
        <div className="mt-1">
          <textarea
            {...props}
            ref={ref ?? null}
            rows={props.rows ?? 4}
            name={name}
            id={name}
            aria-describedby={`${name}-error ${name}-description`}
            aria-invalid={errors ? true : props["aria-invalid"]}
            className={classNames(
              "block w-full rounded-md border-gray-300 shadow-sm placeholder:text-gray-300 focus:border-cyan-700 focus:ring focus:ring-cyan-600 focus:ring-opacity-25 disabled:pointer-events-none disabled:opacity-50 sm:text-sm",
              resizeable ? "resize-y" : "resize-none"
            )}
            defaultValue={""}
          />
          {errors ? (
            <FieldError name={name} errors={errors} />
          ) : (
            description && (
              <p className="mt-2 text-sm text-gray-500" id={`${name}-description`}>
                {description}
              </p>
            )
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
