import { Form, Link, NavLink, useTransition } from "@remix-run/react";
import {
  IconBuildingBank,
  IconDoor,
  IconFileDollar,
  IconLoader,
  IconMapPins,
  IconTicket,
  IconUser,
  IconUsers,
  IconWashMachine,
} from "@tabler/icons-react";
import { useSpinDelay } from "spin-delay";
import { classNames, useUser } from "~/utils/utils";

export function AdminNav() {
  const user = useUser();
  const transition = useTransition();
  const showSpinner = useSpinDelay(transition.state !== "idle");
  return (
    <div className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-gray-200 px-3 py-6 text-[15px]">
      <nav>
        <Link to="/" className="flex items-center px-1">
          <IconWashMachine size={48} className="text-cyan-700" />
          <span className="text-sm font-bold text-cyan-700">
            Machine Manager
          </span>
          <IconLoader
            className={classNames(
              showSpinner ? "opacity-100" : "opacity-0",
              "ml-6 animate-spin text-gray-400 transition-opacity"
            )}
          />
        </Link>
        <ul className="mt-10 space-y-2 border-b border-gray-200 pb-6">
          {nav
            .filter((n) => n.section === "main")
            .map((item) => {
              return (
                <NavLink
                  key={item.href}
                  to={`/admin${item.href}`}
                  end={item.end}
                  className={({ isActive }) =>
                    `block w-full rounded-md px-3 py-2 hover:bg-gray-100 ${
                      isActive ? "bg-gray-100" : ""
                    }`
                  }
                >
                  <li className="flex items-center space-x-4">
                    <div className={`${item.iconBg} rounded-md p-1.5`}>
                      <span aria-hidden="true">{item.icon}</span>
                    </div>
                    <span className="capitalize">{item.name}</span>
                  </li>
                </NavLink>
              );
            })}
        </ul>
        <ul className="mt-6 space-y-2">
          {nav
            .filter((n) => n.section === "settings")
            .map((item) => {
              return (
                <NavLink
                  key={item.href}
                  to={`/admin${item.href}`}
                  end={item.end}
                  className={({ isActive }) =>
                    `block w-full rounded-md px-3 py-2 hover:bg-gray-100 ${
                      isActive ? "bg-gray-100" : ""
                    }`
                  }
                >
                  <li className="flex items-center space-x-4">
                    <div className={`${item.iconBg} rounded-md p-1.5`}>
                      <span aria-hidden="true">{item.icon}</span>
                    </div>
                    <span className="capitalize">{item.name}</span>
                  </li>
                </NavLink>
              );
            })}
        </ul>
      </nav>
      <nav className="mt-auto justify-between gap-2 space-y-2 truncate border-t border-gray-200 px-3 py-2 pt-4 text-sm">
        <div>
          <span className="block font-bold ">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="block text-gray-400">{user?.email}</span>
        </div>
        <Form method="post" action="/logout">
          <button
            type="submit"
            className="text-sm font-medium text-gray-400 hover:text-cyan-700"
          >
            Logout
          </button>
        </Form>
      </nav>
    </div>
  );
}

const nav = [
  // {
  //   name: "Home",
  //   section: "main",
  //   href: "",
  //   icon: <IconHome size={20} className="text-cyan-600" />,
  //   iconBg: "bg-cyan-700/10",
  //   end: true,
  // },
  {
    name: "Tickets",
    section: "main",
    href: "/tickets",
    icon: <IconTicket size={20} className="text-cyan-600" />,
    iconBg: "bg-cyan-700/10",
    end: false,
  },
  {
    name: "Invoices",
    section: "main",
    href: "/invoices",
    icon: <IconFileDollar size={20} className="text-cyan-600" />,
    iconBg: "bg-cyan-700/10",
    end: false,
  },
  {
    name: "Machines",
    section: "main",
    href: "/machines",
    icon: <IconWashMachine size={20} className="text-cyan-600" />,
    iconBg: "bg-cyan-700/10",
    end: false,
  },
  {
    name: "Vendors",
    section: "settings",
    href: "/vendors",
    icon: <IconUsers size={20} className="text-cyan-600" />,
    iconBg: "bg-cyan-700/10",
    end: false,
  },
  {
    name: "Campuses",
    section: "settings",
    href: "/campuses",
    icon: <IconBuildingBank size={20} className="text-cyan-600" />,
    iconBg: "bg-cyan-700/10",
    end: false,
  },
  {
    name: "Locations",
    section: "settings",
    href: "/locations",
    icon: <IconMapPins size={20} className="text-cyan-600" />,
    iconBg: "bg-cyan-700/10",
    end: false,
  },
  {
    name: "Pockets",
    section: "settings",
    href: "/pockets",
    icon: <IconDoor size={20} className="text-cyan-600" />,
    iconBg: "bg-cyan-700/10",
    end: false,
  },
  {
    name: "Users",
    section: "settings",
    href: "/users",
    icon: <IconUser size={20} className="text-cyan-600" />,
    iconBg: "bg-cyan-700/10",
    end: false,
  },
] as const;
