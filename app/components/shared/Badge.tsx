import { classNames } from "~/utils/utils";

export type BadgeProps = {
  text: string;
  size?: "small" | "large";
  color?:
    | "bg-gray-100 text-gray-800"
    | "bg-green-100 text-green-800"
    | "bg-red-100 text-red-800"
    | "bg-yellow-100 text-yellow-800"
    | "bg-blue-100 text-blue-800"
    | "bg-indigo-100 text-indigo-800"
    | "bg-purple-100 text-purple-800"
    | "bg-pink-100 text-pink-800";
};

export function Badge({
  text,
  size = "small",
  color = "bg-gray-100 text-gray-800",
}: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full font-medium",
        color,
        size === "small" ? "px-2.5 py-0.5 text-xs" : "px-3 py-0.5 text-sm"
      )}
    >
      {text}
    </span>
  );
}
