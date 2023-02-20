import { Popover, Transition } from "@headlessui/react";
import { useSearchParams } from "@remix-run/react";
import { IconChevronDown } from "@tabler/icons-react";
import { Fragment } from "react";
import { Checkbox } from "~/components/shared/Checkbox";
import { classNames } from "~/utils/utils";

export type Filter = {
  id: string | number;
  name: string;
  options: Array<{
    value: string | number;
    label: string;
    defaultSelected: boolean;
  }>;
};

type DropdownProps = {
  filters: Filter[];
  /** The orign in which the menu will pop out from the button. Defaults to left */
  direction?: "right" | "left";
  unmount?: boolean;
};

export function TableFilters({
  filters,
  direction = "left",
  unmount = true,
}: DropdownProps) {
  const [searchParams] = useSearchParams();
  return (
    <Popover.Group className="hidden sm:flex sm:items-baseline sm:space-x-8">
      {filters.map((section, index) => (
        <Popover
          as="div"
          key={section.name}
          id={`desktop-menu-${index}`}
          className="relative inline-block text-left"
        >
          <div>
            <Popover.Button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none">
              <span>{section.name}</span>
              <IconChevronDown
                size={20}
                className="-mr-1 ml-1 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
            </Popover.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-75"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
            unmount={unmount}
          >
            <Popover.Panel
              unmount={unmount}
              className={classNames(
                direction === "left"
                  ? "right-0 origin-top-right"
                  : "left-0 origin-top-left",
                "space-x- absolute z-20 mt-2 space-y-3 whitespace-nowrap rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none"
              )}
            >
              {section.options.map((option, index) => (
                <div key={option.value} className="flex items-center">
                  <Checkbox
                    id={`filter-${section.id}-${index}`}
                    label={option.label}
                    name={`${section.id}[${index}]`}
                    defaultValue={option.value}
                    defaultChecked={
                      option.defaultSelected ||
                      searchParams
                        .getAll(`${section.id}[]`)
                        .includes(String(option.value))
                    }
                  />
                </div>
              ))}
            </Popover.Panel>
          </Transition>
        </Popover>
      ))}
    </Popover.Group>
  );
}
