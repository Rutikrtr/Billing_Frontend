import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import {
  GridIcon,
  Logoicon,
  UserCircleIcon,
  ChevronDownIcon,
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
    path: "/dashboard/home",
  },
  {
    icon: <UserCircleIcon />,
    name: "Clients",
    path: "/dashboard/clients",
  },
  {
    icon: <Car />,
    name: "Vehicles",
    subItems: [
      { name: "Add & Edit Vehicle",  path: "/dashboard/vehicle", pro: false },
      { name: "Vehicle Expences", path: "/dashboard/vehicle-expences", pro: false },
    ],
  },
  {
     icon: <Receipt />,
    name: "Billing",
    subItems: [
      { name: "Add & Print Bill", path: "/dashboard/billing", pro: false },
      { name: "Transaction History", path: "/dashboard/transaction-history", pro: false },
    ],
  },
  {
    icon: <Fuel />,
    name: "Fuel",
    path: "/dashboard/fuel",
  },
  {
    name: "Overview",
    icon: <BarChart3 />,
    subItems: [
      { name: "Billing Overview", path: "/dashboard/overview", pro: false },
      { name: "Client Overview", path: "/dashboard/client-overview", pro: false },
    ],
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);

  const isActive = useCallback(
    (path) => {
      if (path === "/dashboard/home") {
        return location.pathname === "/dashboard" || location.pathname === "/dashboard/home";
      }
      return location.pathname === path;
    },
    [location.pathname]
  );

  // Check if any submenu item is active and keep that submenu open
  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu === index) {
        return null;
      }
      return index;
    });
  };

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <div>
              <button
                onClick={() => handleSubmenuToggle(index)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  openSubmenu === index
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
                    openSubmenu === index
                      ? "text-blue-300 drop-shadow-sm"
                      : "text-gray-400 group-hover:text-gray-200 group-hover:scale-110"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="font-medium text-sm tracking-wide">{nav.name}</span>
                    <ChevronDownIcon
                      className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                        openSubmenu === index
                          ? "rotate-180 text-blue-300"
                          : "text-gray-400 group-hover:text-gray-200"
                      }`}
                    />
                  </>
                )}
              </button>
              
              {/* Submenu - Simple show/hide without complex height calculations */}
              {(isExpanded || isHovered || isMobileOpen) && openSubmenu === index && (
                <ul className="mt-2 space-y-1 ml-8 animate-in slide-in-from-top-1 duration-200">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive(subItem.path)
                            ? "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-200 shadow-md border border-blue-400/20"
                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            nav.path && (
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
            )
          )}
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
        <Link to="/dashboard" className="flex items-center gap-3 group">
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