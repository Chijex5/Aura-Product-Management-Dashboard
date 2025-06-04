import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Filter, Mail, Phone, Calendar, AlertCircle, CheckCircle, User, Shield, X, ChevronDown, MoreHorizontal, List } from 'lucide-react';
import { useUserApi } from '../hooks/useUserApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Users = () => {
  const { user } = useAuth();
  const { users, isLoading, error, loadUsers, updateUserStatus, resendVerification } = useUserApi();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('joined');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);
  const dropdownRef = useRef(null);
  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load users on component mount
  useEffect(() => {
    loadUsers(user?.permissions || []);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (dropdownRef.current && target && !(dropdownRef.current as HTMLElement).contains(target)) {
        setIsStatusDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesVerification = verificationFilter === 'all' || 
                                (verificationFilter === 'verified' && user.isVerified) ||
                                (verificationFilter === 'unverified' && !user.isVerified);
      return matchesSearch && matchesStatus && matchesVerification;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'joined':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        case 'email':
          return a.email.localeCompare(b.email);
        default:
          return 0;
      }
    });
  }, [users, searchTerm, statusFilter, verificationFilter, sortBy]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await updateUserStatus(userId, newStatus, user?.permissions || []);
      if (response.success) {
        toast.success(response.message);
        loadUsers(user?.permissions || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
    
    // Close dropdown
    setIsStatusDropdownOpen(prev => ({ ...prev, [userId]: false }));
  };
  
  const handleResendVerification = async (userId) => {
    try {
      const response = await resendVerification(userId, user?.permissions || []);
      if (response.success) {
        toast.success('Verification email sent successfully');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to resend verification email');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
      case 'inactive':
        return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
      case 'suspended':
        return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];
  
  const verificationOptions = [
    { value: 'all', label: 'All Verification' },
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' }
  ];
  
  const sortOptions = [
    { value: 'joined', label: 'Sort by Join Date' },
    { value: 'name', label: 'Sort by Name' },
    { value: 'email', label: 'Sort by Email' }
  ];

  // Toggle dropdown for user status
  const toggleStatusDropdown = (userId) => {
    setIsStatusDropdownOpen(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // User card for mobile view
  const UserCard = ({ user }) => {
    const statusColors = getStatusColor(user.status);
    
    return (
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {user.avatar ? (
              <img 
                className="h-10 w-10 rounded-full object-cover" 
                src={user.avatar} 
                alt={user.name} 
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={18} className="text-gray-500" />
              </div>
            )}
            <div className="ml-3">
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => toggleStatusDropdown(user.id)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreHorizontal size={18} className="text-gray-500" />
            </button>
            
            {isStatusDropdownOpen[user.id] && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button 
                    onClick={() => handleStatusChange(user.id, 'active')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Set Active
                  </button>
                  <button 
                    onClick={() => handleStatusChange(user.id, 'inactive')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Set Inactive
                  </button>
                  <button 
                    onClick={() => handleStatusChange(user.id, 'suspended')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Set Suspended
                  </button>
                  {!user.isVerified && (
                    <button 
                      onClick={() => handleResendVerification(user.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                    >
                      Resend Verification
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center">
            <Phone size={14} className="text-gray-400 mr-1" />
            <span className="text-gray-600">{user.phone || "Not provided"}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar size={14} className="text-gray-400 mr-1" />
            <span className="text-gray-600">{formatDate(user.joinedDate)}</span>
          </div>
          
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full ${statusColors.dot} mr-1`}></div>
            <span className="capitalize">{user.status}</span>
          </div>
          
          <div>
            {user.isVerified ? (
              <span className="inline-flex items-center text-green-700">
                <CheckCircle size={14} className="mr-1" /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center text-yellow-700">
                <AlertCircle size={14} className="mr-1" /> Pending
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="text-2xl font-bold">Users Management</h1>
        <p className="text-gray-500">
          Manage user accounts and verification status
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <User size={18} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Users</p>
              <h3 className="text-xl font-bold">{users.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Verified</p>
              <h3 className="text-xl font-bold">
                {users.filter(u => u.isVerified).length}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100">
              <AlertCircle size={18} className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Pending</p>
              <h3 className="text-xl font-bold">
                {users.filter(u => !u.isVerified).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="flex">
              <button 
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg"
              >
                <Filter size={16} />
                <span>Filters</span>
                <ChevronDown size={16} className={`transform transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {isFiltersOpen && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusFilter === option.value 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
                <div className="flex flex-wrap gap-2">
                  {verificationOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setVerificationFilter(option.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        verificationFilter === option.value 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        sortBy === option.value 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Active Filters */}
          {(statusFilter !== 'all' || verificationFilter !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Status: {statusFilter}
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {verificationFilter !== 'all' && (
                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {verificationFilter === 'verified' ? 'Verified' : 'Unverified'}
                  <button 
                    onClick={() => setVerificationFilter('all')}
                    className="ml-1 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User List */}
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredAndSortedUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <p className="font-medium">No users found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            {isMobileView ? (
              <div className="p-4">
                {filteredAndSortedUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              /* Desktop View - Table */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedUsers.map(user => {
                      const statusColors = getStatusColor(user.status);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.avatar ? (
                                  <img 
                                    className="h-10 w-10 rounded-full object-cover" 
                                    src={user.avatar} 
                                    alt={user.name} 
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User size={18} className="text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone size={14} className="text-gray-400 mr-1" />
                              {user.phone || "Not provided"}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full ${statusColors.dot} mr-2`}></div>
                              <span className={`text-sm font-medium ${statusColors.text}`}>{user.status}</span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isVerified ? (
                              <span className="inline-flex items-center text-sm text-green-700">
                                <CheckCircle size={14} className="mr-1" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-sm text-yellow-700">
                                <AlertCircle size={14} className="mr-1" /> Pending
                              </span>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.joinedDate)}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => toggleStatusDropdown(user.id)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Actions <ChevronDown size={14} className="ml-1" />
                              </button>
                              
                              {isStatusDropdownOpen[user.id] && (
                                <div ref={dropdownRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleStatusChange(user.id, 'active')}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Set Active
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(user.id, 'inactive')}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Set Inactive
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(user.id, 'suspended')}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Set Suspended
                                    </button>
                                    {!user.isVerified && (
                                      <button
                                        onClick={() => handleResendVerification(user.id)}
                                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                      >
                                        Resend Verification
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        
        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredAndSortedUsers.length} of {users.length} users
          </div>
          <div className="flex gap-2">
            <button 
              disabled 
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              disabled 
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;