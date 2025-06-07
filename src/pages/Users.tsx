import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Shield, 
  X, 
  ChevronDown, 
  MoreHorizontal, 
  List,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Clock,
  Eye,
  Settings,
  TrendingUp,
  Trash2
} from 'lucide-react';
import { useUserApi } from '../hooks/useUserApi';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Users = () => {
  const { user } = useAuth();
  const { users, isLoading, error, loadUsers, updateUserStatus, resendVerification } = useUserApi();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDropLoading, setIsDropLoading] = useState<{id: number | null, loading: boolean, type: string}>({id: null, loading: false, type: ''});
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('joined');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Create a ref for each dropdown menu
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (activeDropdown !== null) {
        const dropdownElement = dropdownRefs.current[activeDropdown];
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

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

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      setIsDropLoading({ id: userId, loading: true, type: newStatus });
      const response = await updateUserStatus(userId, newStatus, user?.permissions || []);
      if (response.success) {
        toast.success(response.message);
        loadUsers(user?.permissions || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setIsDropLoading({ id: null, loading: false, type: '' });
    }
    
    setActiveDropdown(null);
  };
  
  const handleResendVerification = async (userId: number) => {
    try {
      setIsDropLoading({ id: userId, loading: true, type: 'verification' });
      const response = await resendVerification(userId, user?.permissions || []);
      if (response.success) {
        toast.success('Verification email sent successfully');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to resend verification email');
    } finally {
      setIsDropLoading({ id: null, loading: false, type: '' });
    }
    
    setActiveDropdown(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', ring: 'ring-green-100' };
      case 'inactive':
        return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', ring: 'ring-gray-100' };
      case 'suspended':
        return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', ring: 'ring-red-100' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500', ring: 'ring-gray-100' };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleDropdown = (userId: number) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  // Function to set dropdown ref
  const setDropdownRef = (userId: number) => (el: HTMLDivElement | null) => {
    dropdownRefs.current[userId] = el;
  };

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];
  
  const verificationOptions = [
    { value: 'all', label: 'All' },
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' }
  ];
  
  const sortOptions = [
    { value: 'joined', label: 'Join Date' },
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' }
  ];

  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.isVerified).length;
  const pendingUsers = users.filter(u => !u.isVerified).length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UsersIcon size={24} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                  Users Management
                </h1>
                <p className="text-xs md:text-sm text-indigo-600 font-medium">
                  Manage user accounts and verification status
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{totalUsers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <UsersIcon size={16} className="text-indigo-600" />
                <span className="text-xs md:text-sm font-medium text-gray-700">Total</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">{totalUsers}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-xs md:text-sm font-medium text-gray-700">Verified</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">{verifiedUsers}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-orange-600" />
                <span className="text-xs md:text-sm font-medium text-gray-700">Pending</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">{pendingUsers}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} className="text-blue-600" />
                <span className="text-xs md:text-sm font-medium text-gray-700">Active</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">{activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-4">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
              />
            </div>

            {/* Filter Toggle */}
            <button 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center justify-center gap-2 w-full md:w-auto bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Filter size={16} />
              <span className="text-sm">Filters</span>
              <ChevronDown size={16} className={`transform transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {/* Expanded Filters */}
          {isFiltersOpen && (
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        statusFilter === option.value 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Verification</label>
                <div className="flex flex-wrap gap-2">
                  {verificationOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setVerificationFilter(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        verificationFilter === option.value 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        sortBy === option.value 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {statusFilter !== 'all' && (
                  <div className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs">
                    Status: {statusFilter}
                    <button 
                      onClick={() => setStatusFilter('all')}
                      className="ml-2 p-0.5 hover:bg-indigo-200 rounded"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                
                {verificationFilter !== 'all' && (
                  <div className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs">
                    {verificationFilter === 'verified' ? 'Verified' : 'Unverified'}
                    <button 
                      onClick={() => setVerificationFilter('all')}
                      className="ml-2 p-0.5 hover:bg-indigo-200 rounded"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          </div>
        ) : filteredAndSortedUsers.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <p className="font-medium text-gray-900">No users found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedUsers.map(userItem => {
              const statusColors = getStatusColor(userItem.status);
              return (
                <div
                  key={userItem.user_id}
                  className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 transition-all duration-200 hover:shadow-xl relative ${activeDropdown === userItem.user_id ? 'z-30' : 'z-10'}`}
                >
                  <div className="flex">
                    {/* Status Indicator */}
                    <div className={`w-1 ${statusColors.dot}`}></div>
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex-shrink-0">
                            {userItem.avatar ? (
                              <img 
                                className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover" 
                                src={userItem.avatar} 
                                alt={userItem.name} 
                              />
                            ) : (
                              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                <User size={18} className="text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                                {userItem.name}
                              </h3>
                              {userItem.isVerified ? (
                                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                              ) : (
                                <AlertCircle size={16} className="text-orange-600 flex-shrink-0" />
                              )}
                            </div>
                            
                            <p className="text-xs md:text-sm text-gray-600 mb-2 truncate">
                              {userItem.email}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Phone size={12} />
                                <span>{userItem.phone || "Not provided"}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar size={12} />
                                <span>{formatDate(userItem.joinedDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${statusColors.dot}`}></div>
                                <span className="capitalize">{userItem.status}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions - Button only */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(userItem.user_id);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal size={18} className="text-gray-500" />
                        </button>

                      </div>
                    </div>
                  </div>
                  
                  {/* Dropdown Menu - Now with individual ref */}
                  {activeDropdown === userItem.user_id && (
                    <div 
                      ref={setDropdownRef(userItem.user_id)}
                      className="absolute right-4 top-16 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          handleStatusChange(userItem.user_id, 'active');
                        }}
                        disabled={isDropLoading.id === userItem.user_id && isDropLoading.loading}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <UserCheck size={16} className="mr-3" />
                        {isDropLoading.id === userItem.user_id && isDropLoading.loading && isDropLoading.type === 'active' ? 'Loading...' : 'Set Active'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(userItem.user_id, 'inactive')}
                        disabled={isDropLoading.id === userItem.user_id && isDropLoading.loading}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <UserX size={16} className="mr-3" />
                        {isDropLoading.id === userItem.user_id && isDropLoading.loading && isDropLoading.type === 'inactive' ? 'Loading...' : 'Set Inactive'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(userItem.user_id, 'suspended')}
                        disabled={isDropLoading.id === userItem.user_id && isDropLoading.loading}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <Shield size={16} className="mr-3" />
                        {isDropLoading.id === userItem.user_id && isDropLoading.loading && isDropLoading.type === 'suspended' ? 'Loading...' : 'Set Suspended'}
                      </button>
                      {!userItem.isVerified && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleResendVerification(userItem.user_id)}
                            disabled={isDropLoading.id === userItem.user_id && isDropLoading.loading}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Mail size={16} className="mr-3" />
                            {isDropLoading.id === userItem.user_id && isDropLoading.loading && isDropLoading.type === 'verification' ? 'Loading...' : 'Resend Verification'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Results Summary */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredAndSortedUsers.length} of {totalUsers} users</span>
            <div className="flex items-center space-x-2">
              <Eye size={16} />
              <span>Results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;