import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import Backdrop from './Backdrop';

const AppLayout = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
      } ${isMobileOpen ? "ml-0" : ""}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-7xl md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
