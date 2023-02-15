import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
};
export function FormMenu({ title, icon, children }: Props) {
  return (
    <Menu as="div" className="relative inline-block w-min">
      <Menu.Button className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm transition duration-75 hover:bg-gray-50 focus:border-cyan-700 focus:outline-none focus:ring focus:ring-cyan-600 focus:ring-opacity-25">
        {icon && icon}
        <span className="ml-2 mr-3 whitespace-nowrap">{title}</span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-[25ms]"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
        unmount={false}
      >
        <Menu.Items
          unmount={false}
          className="absolute left-0 z-20 mt-2 w-min origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="p-4">{children}</div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
