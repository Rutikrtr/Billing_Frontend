import React, { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import {
  GridIcon,
  Logoicon,
  UserCircleIcon,
} from '../../icons';

import {
  Car,
  Receipt,
  Fuel,
  BarChart3,
} from "lucide-react";

const navItems = [
  {
    icon: <GridIcon />,
    name: "Home",
    path: "/dashboard/home", // Fixed: Updated to match nested routes
  },
  {
    icon: <UserCircleIcon />,
    name: "Clients",
    path: "/dashboard/clients", // Fixed: Updated to match nested routes
  },
  {
    icon: <Car />,
    name: "Vehicles",
    path: "/dashboard/vehicle", // Fixed: Updated to match nested routes
  },
  {
    icon: <Receipt />,
    name: "Billing",
    path: "/dashboard/billig", // Fixed: Updated to match nested routes
  },
  {
    icon: <Fuel />,
    name: "Fuel",
    path: "/dashboard/fuel", // Fixed: Updated to match nested routes
  },
  {
    icon: <BarChart3 />,
    name: "Billing Overview",
    path: "/dashboard/overview", // Fixed: Updated to match nested routes
  },
  {
    icon: <BarChart3 />,
    name: "Client Overview",
    path: "/dashboard/client-overview", // Fixed: Updated to match nested routes
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  // Enhanced isActive function to handle both exact matches and index route
  const isActive = useCallback(
    (path) => {
      // Handle the home/index route specially
      if (path === "/dashboard/home") {
        return location.pathname === "/dashboard" || location.pathname === "/dashboard/home";
      }
      return location.pathname === path;
    },
    [location.pathname]
  );

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          <Link
            to={nav.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
              isActive(nav.path)
                ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white shadow-lg shadow-blue-500/10 border border-blue-400/30 backdrop-blur-sm"
                : "text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/40 hover:to-gray-600/20 hover:text-white hover:shadow-md hover:shadow-gray-900/20 border border-transparent hover:border-gray-600/30 backdrop-blur-sm"
            } ${
              !isExpanded && !isHovered
                ? "lg:justify-center"
                : "lg:justify-start"
            }`}
          >
            <span
              className={`flex-shrink-0 w-5 h-5 transition-all duration-300 ${
                isActive(nav.path)
                  ? "text-blue-300 drop-shadow-sm"
                  : "text-gray-400 group-hover:text-gray-200 group-hover:scale-110"
              }`}
            >
              {nav.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="font-medium text-sm tracking-wide">{nav.name}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-gradient-to-b from-[#1a1d23] to-[#0f1115] backdrop-blur-xl border-r border-gray-800/40 shadow-2xl text-gray-100 h-screen transition-all duration-300 ease-in-out z-50
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/dashboard" className="flex items-center gap-3 group"> {/* Fixed: Updated logo link */}
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Logoicon className="w-8 h-8 text-blue-400 drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
              <span className="font-bold text-xl text-white drop-shadow-sm">
                Dashboard
              </span>
            </>
          ) : (
            <Logoicon className="w-8 h-8 text-blue-400 drop-shadow-sm hover:scale-105 transition-transform duration-300" />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear scrollbar-hide">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className={`mb-4 text-xs uppercase font-semibold flex leading-[20px] text-gray-500 tracking-wider ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Navigation" : "•••"}
              </h2>
              {renderMenuItems()}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;