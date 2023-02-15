import { NavLink } from "@remix-run/react";
import { classNames } from "~/utils/utils";

const tabs = [
  { name: "Events", href: "events" },
  { name: "Charges", href: "charges" },
  { name: "Related Tickets", href: "related" },
];

export function TicketNav() {
  return (
    <div className="border-b border-gray-200 pb-5 sm:pb-0">
      <div className="mt-3 sm:mt-4">
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.href}
                className={({ isActive }) =>
                  classNames(
                    "whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium",
                    isActive
                      ? "border-cyan-700 text-cyan-700"
                      : "border-transparent hover:border-gray-300"
                  )
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
