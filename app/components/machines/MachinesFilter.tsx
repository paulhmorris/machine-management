import { Disclosure } from "@headlessui/react";
import type { Campus, Location, MachineType } from "@prisma/client";
import { Form, useSearchParams, useTransition } from "@remix-run/react";
import { IconChevronRight, IconRefresh } from "@tabler/icons-react";
import { Button } from "~/components/shared/Button";
import { Checkbox } from "~/components/shared/Checkbox";
import { Select } from "~/components/shared/Select";

type Props = {
  campuses: Array<Pick<Campus, "id" | "name">>;
  locations: Array<Pick<Location, "id" | "name">>;
  machineTypes: Array<Pick<MachineType, "id" | "name">>;
};
export function MachinesFilter({ campuses, locations, machineTypes }: Props) {
  const transition = useTransition();
  const [searchParams] = useSearchParams();

  return (
    <Form method="get" className="mt-6">
      <Disclosure
        as="section"
        aria-labelledby="filter-heading"
        className="grid items-center border-t border-gray-200"
      >
        {({ open }) => (
          <>
            <h2 id="filter-heading" className="sr-only">
              Filters
            </h2>
            <div className="relative col-start-1 row-start-1 py-4">
              <div className="mx-auto flex space-x-6 px-4 text-sm sm:px-6 lg:px-8">
                <Disclosure.Button
                  as={Button}
                  variant="secondary"
                  className="group flex items-center gap-2 font-medium text-gray-700"
                >
                  Filters
                  <IconChevronRight
                    size={20}
                    aria-hidden="true"
                    className={
                      open
                        ? "rotate-90 transition duration-75"
                        : "rotate-0 transition duration-75"
                    }
                  />
                </Disclosure.Button>
                <div>
                  <Button
                    type="submit"
                    disabled={transition.state === "submitting"}
                  >
                    <span>Refresh</span>
                    <IconRefresh size={18} />
                  </Button>
                </div>
              </div>
            </div>
            <Disclosure.Panel className="border-t border-gray-200 py-6">
              <div className="mx-auto grid grid-cols-2 gap-x-4 px-4 text-sm sm:px-6 md:gap-x-6 lg:px-8">
                <div className="grid auto-rows-min grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-6">
                  <fieldset>
                    <legend className="block font-medium">Campus</legend>
                    <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                      {campuses.map((campus) => {
                        return (
                          <Checkbox
                            key={campus.id}
                            name="campusIds"
                            label={campus.name}
                            id={campus.id}
                            value={campus.name.toLowerCase()}
                            defaultChecked={searchParams
                              .getAll("campusIds")
                              .includes(campus.id)}
                          />
                        );
                      })}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className="block font-medium">Location</legend>
                    <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                      <Select
                        label="Locations"
                        name="locationId"
                        defaultValue={searchParams.get("locationId") || "all"}
                        hideLabel
                      >
                        <option value="all">All</option>
                        {locations.map((location) => {
                          return (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          );
                        })}
                      </Select>
                    </div>
                  </fieldset>
                </div>
                <div className="grid auto-rows-min grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-6">
                  <fieldset>
                    <legend className="block font-medium">Type</legend>
                    <div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
                      {machineTypes.map((machineType) => {
                        return (
                          <Checkbox
                            key={`machineType-${machineType.id}`}
                            name="machineTypeIds"
                            label={machineType.name}
                            id={String(machineType.name)}
                            value={machineType.name.toLowerCase()}
                            defaultChecked={searchParams
                              .getAll("machineTypeIds")
                              .includes(String(machineType.id))}
                          />
                        );
                      })}
                    </div>
                  </fieldset>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </Form>
  );
}
