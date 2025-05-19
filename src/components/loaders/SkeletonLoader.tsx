import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, Settings, Search, ChevronDown, Home, LayoutDashboard, ShoppingBag, Users, BarChart2, Database } from 'lucide-react';

const DashboardSkeletonLoader = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} duration-300 transition-all bg-gray-900 text-white relative`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800">
          <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="h-8 w-8 rounded bg-gray-100 animate-pulse"></div>
            {sidebarOpen && (
              <div className="ml-3 w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
            )}
          </div>
          {sidebarOpen && (
            <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Sidebar menu items */}
        <div className="p-4">
          <div className={`space-y-4 ${!sidebarOpen && 'flex flex-col items-center'}`}>
            <div className={`flex items-center py-2 px-2 rounded-lg bg-blue-800 bg-opacity-30 ${!sidebarOpen && 'justify-center'}`}>
              <Home size={20} className="text-blue-400" />
              {sidebarOpen && <div className="ml-3 w-20 h-4 bg-gray-700 rounded animate-pulse"></div>}
            </div>

            {['dashboard', 'products', 'Admins', 'Statistics', 'Resources'].map((item, index) => (
              <div key={index} className={`flex items-center py-2 px-2 rounded-lg hover:bg-gray-800 ${!sidebarOpen && 'justify-center'}`}>
                {index === 0 && <LayoutDashboard size={20} className="" />}
                {index === 1 && <ShoppingBag size={20} className="" />}
                {index === 2 && <Users size={20} className="" />}
                {index === 3 && <BarChart2 size={20} className="" />}
                {index === 4 && <Database size={20} className="" />}
                {sidebarOpen && <div className="ml-3 w-20 h-4 bg-gray-700 rounded animate-pulse"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            {!sidebarOpen && (
              <button onClick={toggleSidebar} className="mr-4 text-gray-500 hover:text-gray-700">
                <Menu size={24} />
              </button>
            )}
            <div className="relative md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <div className="h-8 w-full bg-gray-200 rounded-md animate-pulse pl-10"></div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-gray-400 hover:bg-gray-400 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
            </button>
            <button className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
              <Settings size={20} />
            </button>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse"></div>
              <ChevronDown size={16} className="ml-1 text-gray-500" />
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Page header */}
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-24 bg-gray-300 rounded animate-pulse mb-4"></div>
                <div className="flex items-center">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-8 bg-green-200 rounded animate-pulse ml-2"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Main content sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart section */}
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-64 w-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <div className="w-4/5 h-4/5">
                  <div className="flex h-full items-end justify-around">
                    {[35, 65, 40, 70, 55, 80, 45, 60, 50, 75, 40, 65].map((height, i) => (
                      <div key={i} className="w-4 md:w-6 bg-blue-200 opacity-75 rounded-t" style={{height: `${height}%`}}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-40 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table section */}
          <div className="bg-white rounded-lg shadow mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <th key={item} className="px-6 py-3 text-left">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <tr key={row}>
                      {[1, 2, 3, 4, 5].map((col) => (
                        <td key={col} className="px-6 py-4">
                          <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardSkeletonLoader;