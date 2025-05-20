import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Mail, Phone, Calendar, AlertCircle, CheckCircle, User, Shield, Key, Lock, ExternalLink } from 'lucide-react';
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

  // Load users on component mount
  useEffect(() => {
    loadUsers(user?.permissions || []);
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

  const handleStatusChange = async (userId: number, newStatus:string) => {
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
  };
  
  const handleResendVerification = async (userId: number) => {
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

  const getStatusColor = (status:string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date:string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users Management</h1>
        <p className="text-gray-500">
          Manage user accounts and verification status
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500">
              <User size={20} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{users.length}</h3>
          <p className="text-gray-500 text-sm">Total Users</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-500">
              <CheckCircle size={20} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">
            {users.filter(u => u.isVerified).length}
          </h3>
          <p className="text-gray-500 text-sm">Verified Users</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-yellow-500">
              <AlertCircle size={20} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">
            {users.filter(u => !u.isVerified).length}
          </h3>
          <p className="text-gray-500 text-sm">Pending Verification</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              className="border border-gray-300 rounded-md text-sm py-2 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select 
              value={verificationFilter} 
              onChange={e => setVerificationFilter(e.target.value)} 
              className="border border-gray-300 rounded-md text-sm py-2 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)} 
              className="border border-gray-300 rounded-md text-sm py-2 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="joined">Sort by Join Date</option>
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredAndSortedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={user.avatar} 
                              alt={user.name} 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User size={20} className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone size={16} className="text-gray-400 mr-1" />
                        {user.phone || "Not provided"}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.isVerified ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={14} className="mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle size={14} className="mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.joinedDate)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <select 
                          value={user.status} 
                          onChange={e => handleStatusChange(user.id, e.target.value)} 
                          className="border border-gray-300 rounded-md text-sm py-1 px-2"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        
                        {!user.isVerified && (
                          <button
                            onClick={() => handleResendVerification(user.id)}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded-md text-sm"
                            title="Resend verification email"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-medium">
              {Math.min(filteredAndSortedUsers.length, 1)}
            </span>{' '}
            to{' '}
            <span className="font-medium">{filteredAndSortedUsers.length}</span>{' '}
            of <span className="font-medium">{users.length}</span> users
          </div>
          <div className="flex space-x-2">
            <button 
              disabled 
              className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              disabled 
              className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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