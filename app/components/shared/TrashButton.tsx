import { IconTrash } from "@tabler/icons-react";
import type { ComponentPropsWithoutRef } from "react";

type TrashButtonProps = ComponentPropsWithoutRef<"button">;

export function TrashButton(props: TrashButtonProps) {
  return (
    <button
      {...props}
      className="group cursor-pointer rounded-md p-2 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {props.children}
      <IconTrash size={20} className="transition-colors duration-75 group-hover:text-red-500" aria-hidden="true" />
    </button>
  );
}
