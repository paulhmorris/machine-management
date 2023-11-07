import type { TablerIconsProps } from "@tabler/icons-react";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "~/utils/utils";

interface Props extends TablerIconsProps {
  size?: number;
  variant?: "white" | "blue";
}
export function Spinner({ size = 20, variant = "white", ...props }: Props) {
  return (
    <IconLoader2
      {...props}
      size={size}
      stroke={3}
      className={cn(
        props.className,
        "animate-spin transition-opacity",
        variant === "white" ? "text-white/50" : "text-cyan-700/50"
      )}
    />
  );
}
