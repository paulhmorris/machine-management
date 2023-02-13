import { Link, NavLink } from "@remix-run/react";
import {
  IconBuildingBank,
  IconFileDollar,
  IconHome,
  IconMapPins,
  IconTicket,
  IconUsers,
  IconWashMachine,
} from "@tabler/icons-react";
import { useOptionalUser } from "~/utils";

export function AdminNav() {
  const user = useOptionalUser();
  return (
    <div className="flex w-60 min-w-[200px] flex-col border-r border-gray-200 py-6 px-3">
      <nav>
        <ul className="space-y-2">
          {nav.map((item) => {
            return (
              <NavLink
                key={item.href}
                to={`/admin${item.href}`}
                className={({ isActive }) =>
                  `block w-full rounded-md px-3 py-2 hover:bg-gray-100 ${
                    isActive ? "bg-gray-200" : ""
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
      <div className="mt-auto border-t border-gray-200 pt-4">
        <Link to={`/admin/users/${user?.id}`}>
          <span className="block">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="block">{user?.email}</span>
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
  },
  {
    name: "Tickets",
    href: "/tickets",
    icon: <IconTicket size={20} className="text-blue-500" />,
    iconBg: "bg-blue-100",
  },
  {
    name: "Campuses",
    href: "/campuses",
    icon: <IconBuildingBank size={20} className="text-teal-500" />,
    iconBg: "bg-teal-100",
  },
  {
    name: "Locations",
    href: "/locations",
    icon: <IconMapPins size={20} className="text-indigo-500" />,
    iconBg: "bg-indigo-100",
  },
  {
    name: "Vendors",
    href: "/vendors",
    icon: <IconUsers size={20} className="text-orange-500" />,
    iconBg: "bg-orange-100",
  },
  {
    name: "Machines",
    href: "/machines",
    icon: <IconWashMachine size={20} className="text-pink-500" />,
    iconBg: "bg-pink-100",
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: <IconFileDollar size={20} className="text-emerald-500" />,
    iconBg: "bg-emerald-100",
  },
];
