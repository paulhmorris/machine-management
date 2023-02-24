import type { TablerIconsProps } from "@tabler/icons-react";
import { IconLoader2 } from "@tabler/icons-react";
import { classNames } from "~/utils/utils";

interface Props extends TablerIconsProps {
  size?: number;
}
export function Spinner({ size = 20, ...props }: Props) {
  return (
    <IconLoader2
      {...props}
      size={size}
      stroke={3}
      className={classNames("animate-spin text-white/50", props.className)}
    />
  );
}
