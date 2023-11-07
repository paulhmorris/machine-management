import { cn } from "~/utils/utils";

export type BadgeProps = {
  text: string;
  size?: "small" | "large";
  color?:
    | "bg-gray-100 text-gray-800 border-gray-300"
    | "bg-green-100 text-green-800 border-green-300"
    | "bg-red-100 text-red-800 border-red-300"
    | "bg-yellow-100 text-yellow-800 border-yellow-300"
    | "bg-blue-100 text-blue-800 border-blue-300"
    | "bg-indigo-100 text-indigo-800 border-indigo-300"
    | "bg-purple-100 text-purple-800 border-purple-300"
    | "bg-pink-100 text-pink-800 border-pink-300";
};

export function Badge({ text, size = "small", color = "bg-gray-100 text-gray-800 border-gray-300" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        color,
        size === "small" ? "px-2.5 py-0.5 text-xs" : "px-3 py-0.5 text-sm"
      )}
    >
      {text}
    </span>
  );
}
