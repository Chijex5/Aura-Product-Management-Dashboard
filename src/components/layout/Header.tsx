import React from 'react';
import { Menu, Bell, Settings, Search, ChevronDown, User } from 'lucide-react';
import { useMobileMenu } from '../../contexts/MobileMenuContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/stores/authStore';
const Header = () => {
  const {
    toggleMenu,
    setSidebarOpen,
    sidebarOpen
  } = useMobileMenu();
  const {
    notifications,
  } = useAuthStore();
  const {
    user,
    isLoading
  } = useAuth();
  const unreadNotifications = notifications.filter(notification => !notification.read).length;
  const hasUnreadNotifications = unreadNotifications > 0;
  const navigate = useNavigate();
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const renderUserProfile = () => {
    if (isLoading) {
      return <div className="flex items-center animate-pulse">
          <div className="h-8 w-8 rounded-full bg-gray-300"></div>
          <ChevronDown size={16} className="ml-1 text-gray-500" />
        </div>;
    }
    if (!user) {
      return <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <User size={16} className="text-gray-500" />
          </div>
          <ChevronDown size={16} className="ml-1 text-gray-500" />
        </div>;
    }
    return <div onClick={() => navigate('/account/profile')} className="flex items-center cursor-pointer">
        {user.avatar ? <img className="h-8 w-8 rounded-full object-cover" src={user.avatar} alt={user.name || 'User avatar'} onError={e => {
        e.target.onerror = null;
        e.target.src = 'https://via.placeholder.com/32';
      }} /> : <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
          </div>}
        <ChevronDown size={16} className="ml-1 text-gray-500" />
      </div>;
  };
  return <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        {!sidebarOpen && <button onClick={toggleSidebar} className="mr-4 hidden md:block text-gray-500 hover:text-gray-700" aria-label="Toggle sidebar">
            <Menu size={24} />
          </button>}
        <button onClick={toggleMenu} className="mr-4 md:hidden text-gray-500 hover:text-gray-700" aria-label="Toggle sidebar">
            <Menu size={24} />
          </button>
        
        <div className="md:w-64 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input type="text" placeholder="Search..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          className="p-1 flex space-between items-center rounded-full text-indigo-400 hover:bg-gray-100 relative"
          onClick={() => navigate('/notifications')}
          aria-label='Notifications'
        >
          <Bell size={20} />
          {hasUnreadNotifications && (
            <div className="ml-2 bg-indigo-100 text-indigo-700 text-xs rounded-full px-2 py-1">
              {unreadNotifications}
            </div>
          )}
        </button>
        
        {renderUserProfile()}
      </div>
    </header>;
};
export default Header;