import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LogOut, ShoppingCart, LayoutDashboard, ShoppingBag, Users, BarChart2, Database } from 'lucide-react';
import { useMobileMenu } from '../../contexts/MobileMenuContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users as UsersIcon } from 'lucide-react';
const Sidebar = () => {
  const {
    isOpen,
    closeMenu,
    sidebarOpen,
    setSidebarOpen
  } = useMobileMenu();
  const {
    logout
  } = useAuth();
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const navItems = [{
    path: '/',
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard'
  }, {
    path: '/products',
    icon: <ShoppingBag size={20} />,
    label: 'Products'
  }, {
    path: '/users',
    icon: <UsersIcon size={20} />,
    label: 'Users'
  }, {
    path: '/admins',
    icon: <Users size={20} />,
    label: 'Admins'
  }, {
    path: '/orders',
    icon: <ShoppingCart size={20} />,
    label: 'Order'
  }, {
    path: '/resources',
    icon: <Database size={20} />,
    label: 'Resources'
  }];
  const handleNavClick = () => {
    closeMenu();
  };
  return <>
      {/* Desktop Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col duration-300 transition-all bg-gray-900 text-white relative`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800">
          <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="h-8 w-8 rounded">
              <svg className="w-8 h-8 text-gray-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            {sidebarOpen && <h2 className="ml-3 text-white font-medium">Aura Dashboard</h2>}
          </div>
          {sidebarOpen && <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>}
        </div>

        {/* Sidebar menu items */}
        <div className="p-4">
          <div className={`space-y-4 ${!sidebarOpen && 'flex flex-col items-center'}`}>
            {navItems.map((item, index) => <NavLink key={item.path} to={item.path} className={({
            isActive
          }) => `flex items-center py-2 px-2 rounded-lg 
                  ${isActive ? 'bg-blue-800 bg-opacity-30 text-blue-400' : 'hover:bg-gray-800 text-gray-300 hover:text-white'} 
                  ${!sidebarOpen && 'justify-center'}`}>
                <span>{item.icon}</span>
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </NavLink>)}
          </div>
        </div>

        {/* Logout section */}
        {sidebarOpen && <div className="mt-auto p-4 border-t border-gray-800">
            <button onClick={logout} className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white">
              <LogOut size={20} />
              <span className="ml-3">Sign out</span>
            </button>
          </div>}
        {!sidebarOpen && <div className="mt-auto p-4 flex justify-center">
            <button onClick={logout} className="p-2 text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white">
              <LogOut size={20} />
            </button>
          </div>}
      </div>

      {/* Mobile Menu Button - to be placed in your header component */}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-in-out z-40 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeMenu}></div>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out z-50 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded">
              <svg className="w-8 h-8 text-gray-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="ml-3 text-white font-medium">Aura Dashboard</h2>
          </div>
          <button onClick={closeMenu} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {navItems.map(item => <NavLink key={item.path} to={item.path} onClick={handleNavClick} className={({
            isActive
          }) => `flex items-center py-2 px-2 rounded-lg ${isActive ? 'bg-blue-800 bg-opacity-30 text-blue-400' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span>{item.icon}</span>
                <span className="ml-3">{item.label}</span>
              </NavLink>)}
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-gray-800">
          <button onClick={() => {
          closeMenu();
          logout();
        }} className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white">
            <LogOut size={20} />
            <span className="ml-3">Sign out</span>
          </button>
        </div>
      </aside>
    </>;
};
export default Sidebar;