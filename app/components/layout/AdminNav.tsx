import { Link, NavLink } from "@remix-run/react";
import {
  IconBuildingBank,
  IconChevronRight,
  IconFileDollar,
  IconHome,
  IconMapPins,
  IconTicket,
  IconUsers,
  IconWashMachine,
} from "@tabler/icons-react";
import { useOptionalUser } from "~/utils/utils";

export function AdminNav() {
  const user = useOptionalUser();
  return (
    <div className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-gray-200 px-3 py-6">
      <nav>
        <Link to="/" className="inline-flex items-center px-1">
          <IconWashMachine size={48} className="text-cyan-700" />
          <span className="text-sm font-bold text-cyan-700">
            Machine Manager
          </span>
        </Link>
        <ul className="mt-10 space-y-2">
          {nav.map((item) => {
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
      <div className="mt-auto border-t border-gray-200 pt-4 text-sm">
        <Link
          to={`/admin/users/${user?.id}`}
          className="group flex items-center rounded-md px-3 py-2 hover:bg-gray-100"
        >
          <div>
            <span className="block font-bold ">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="block text-gray-400">{user?.email}</span>
          </div>
          <span className="ml-auto transition duration-200 ease-out group-hover:translate-x-1">
            <IconChevronRight size={20} />
          </span>
        </Link>
      </div>
    </div>
  );
}

const nav = [
  {
    name: "Home",
    href: "",
    icon: <IconHome size={20} className="text-gray-500" />,
    iconBg: "bg-gray-100",
    end: true,
  },
  {
    name: "Tickets",
    href: "/tickets",
    icon: <IconTicket size={20} className="text-blue-500" />,
    iconBg: "bg-blue-100",
    end: false,
  },
  {
    name: "Machines",
    href: "/machines",
    icon: <IconWashMachine size={20} className="text-pink-500" />,
    iconBg: "bg-pink-100",
    end: false,
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: <IconFileDollar size={20} className="text-emerald-500" />,
    iconBg: "bg-emerald-100",
    end: false,
  },
  {
    name: "Vendors",
    href: "/vendors",
    icon: <IconUsers size={20} className="text-orange-500" />,
    iconBg: "bg-orange-100",
    end: false,
  },
  {
    name: "Campuses",
    href: "/campuses",
    icon: <IconBuildingBank size={20} className="text-teal-500" />,
    iconBg: "bg-teal-100",
    end: false,
  },
  {
    name: "Locations",
    href: "/locations",
    icon: <IconMapPins size={20} className="text-indigo-500" />,
    iconBg: "bg-indigo-100",
    end: false,
  },
];
