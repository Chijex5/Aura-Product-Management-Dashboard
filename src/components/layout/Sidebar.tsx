import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, BarChart2, Database, LogOut, X } from 'lucide-react';
import { useMobileMenu } from '../../contexts/MobileMenuContext';
import { useAuth } from '../../contexts/AuthContext';
const Sidebar = () => {
  const {
    isOpen,
    closeMenu
  } = useMobileMenu();
  const {
    logout
  } = useAuth();
  const navItems = [{
    path: '/',
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard'
  }, {
    path: '/products',
    icon: <ShoppingBag size={20} />,
    label: 'Products'
  }, {
    path: '/admins',
    icon: <Users size={20} />,
    label: 'Admins'
  }, {
    path: '/statistics',
    icon: <BarChart2 size={20} />,
    label: 'Statistics'
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
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Perfume Admin</h2>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map(item => <li key={item.path}>
                <NavLink to={item.path} className={({
              isActive
            }) => `flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>)}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
            <LogOut size={20} className="mr-3" />
            Sign out
          </button>
        </div>
      </aside>
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-in-out z-20 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeMenu}></div>
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 ease-in-out z-30 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Perfume Admin</h2>
          <button onClick={closeMenu} className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map(item => <li key={item.path}>
                <NavLink to={item.path} onClick={handleNavClick} className={({
              isActive
            }) => `flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>)}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={() => {
          closeMenu();
          logout();
        }} className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
            <LogOut size={20} className="mr-3" />
            Sign out
          </button>
        </div>
      </aside>
    </>;
};
export default Sidebar;