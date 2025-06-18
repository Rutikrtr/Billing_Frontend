import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import UserDropdown from './UserDropdown'; // Import the UserDropdown component

const AppHeader = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-50 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
          >
            {isMobileOpen ? "✕" : "☰"}
          </button>
          
          <Link to="/" className="lg:hidden font-bold text-xl">
            Dashboard
          </Link>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-orange-500 dark:text-white">
              {user?.firmName || "Guest"}
            </h2>
          </div>
        </div>
        
        {/* Desktop view - show UserDropdown directly */}
        <div className="hidden lg:flex items-center justify-end px-0">
          <UserDropdown user={user} onLogout={handleLogout} />
        </div>

        {/* Mobile view - toggle menu */}
        <div className={`${isMenuOpen ? "flex" : "hidden"} items-center justify-between w-full gap-4 px-5 py-4 lg:hidden`}>
          <div className="flex items-center gap-4">
            <span className="text-sm">Hello, {user?.fullname}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;