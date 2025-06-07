import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';;
import SelfService from '@/services/selfService';
import { 
  User, 
  Shield, 
  Key, 
  Activity, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Check,
  AlertTriangle,
  Clock,
  Plus,
  Phone,
  Mail,
  Calendar,
  Edit3,
  Trash2,
  LogIn,
  Info,
  AlertCircle,
  CheckCircle,

  Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Interfaces
interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  department?: string;
  location?: string;
  joinDate: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ProfileFormData {
  name: string;
  email: string;
  phoneNumber?: string;
}

interface ProfileFormErrors {
  name?: string;
  email?: string;
  phoneNumber?: string;
}

const permissionCategories = {
  products: {
    name: 'Products',
    description: 'Manage product catalog',
    permissions: [
      { id: 'products.view', name: 'View Products', description: 'Can view product listings and details' },
      { id: 'products.create', name: 'Create Products', description: 'Can add new products to the catalog' },
      { id: 'products.edit', name: 'Edit Products', description: 'Can modify existing product details' },
      { id: 'products.delete', name: 'Delete Products', description: 'Can remove products from the catalog' },
      { id: 'products.inventory', name: 'Manage Inventory', description: 'Can update stock levels and inventory status' },
      { id: 'products.pricing', name: 'Manage Pricing', description: 'Can set and update product pricing' }
    ]
  },
  users: {
    name: 'Users',
    description: 'Manage user accounts',
    permissions: [
      { id: 'users.view', name: 'View Users', description: 'Can view user account details' },
      { id: 'users.create', name: 'Create Users', description: 'Can create new user accounts' },
      { id: 'users.edit', name: 'Edit Users', description: 'Can modify existing user accounts' },
      { id: 'users.delete', name: 'Delete Users', description: 'Can remove user accounts' }
    ]
  },
  analytics: {
    name: 'Analytics',
    description: 'Access reporting and analytics',
    permissions: [
      { id: 'analytics.view', name: 'View Reports', description: 'Can view analytics dashboards and reports' },
      { id: 'analytics.export', name: 'Export Reports', description: 'Can export analytics data' }
    ]
  },
  settings: {
    name: 'Settings',
    description: 'System configuration',
    permissions: [
      { id: 'settings.view', name: 'View Settings', description: 'Can view system settings' },
      { id: 'settings.edit', name: 'Edit Settings', description: 'Can modify system configuration' }
    ]
  },
  admin: {
    name: 'Admin Management',
    description: 'Manage admin users',
    permissions: [
      { id: 'admin.view', name: 'View Admins', description: 'Can view admin user accounts' },
      { id: 'admin.create', name: 'Create Admins', description: 'Can create new admin accounts' },
      { id: 'admin.edit', name: 'Edit Admins', description: 'Can modify existing admin accounts' },
      { id: 'admin.delete', name: 'Delete Admins', description: 'Can remove admin accounts' }
    ]
  }
};

const AdminProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const { user, setUser, activityLogs } = useAuthStore();
  const activities = activityLogs;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});

  // Tab component
  const TabButton: React.FC<{ id: string; label: string; icon: React.ReactNode; activeTab: string; setActiveTab: (tab: string) => void }> = 
    ({ id, label, icon, activeTab, setActiveTab }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center justify-center md:justify-start space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full md:w-auto ${
        activeTab === id
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return <Plus size={20} className="text-green-600" />;
      case 'UPDATE':
        return <Edit3 size={20} className="text-blue-600" />;
      case 'DELETE':
        return <Trash2 size={20} className="text-red-600" />;
      case 'LOGIN':
        return <LogIn size={20} className="text-purple-600" />;
      default:
        return <Activity size={20} className="text-gray-600" />;
    }
  };

  // Get icon and styling based on severity type
  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SUCCESS':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'WARNING':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'ERROR':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'INFO':
      default:
        return <Info size={16} className="text-blue-600" />;
    }
  };

  // Get styling classes for type badge
  const getTypeStyles = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ERROR':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'INFO':
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // Get module styling
  const getModuleStyles = (module: string) => {
    switch (module.toUpperCase()) {
      case 'PRODUCT':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ADMIN':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'USER':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Parse and format the description to extract main action and data
  const parseDescription = (description: string) => {
    const parts = description.split(' | Data: ');
    const mainAction = parts[0];
    const data = parts[1] || '';
    
    return { mainAction, data };
  };

  // Handlers
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateProfileForm = (): boolean => {
    const errors: ProfileFormErrors = {};
    
    if (!profileForm.name.trim()) errors.name = 'Name is required';
    if (!profileForm.email.trim()) errors.email = 'Email is required';
    if (!profileForm.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) errors.email = 'Valid email is required';
    if (profileForm.phoneNumber && !profileForm.phoneNumber.match(/^[\+]?[\d\s\-\(\)]+$/)) errors.phoneNumber = 'Valid phone number is required';

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: PasswordFormErrors = {};
    
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    if (passwordForm.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const hasChanged = () => {
    return (
      profileForm.name !== user?.name ||
      profileForm.phoneNumber !== user?.phoneNumber
    );
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;
    
    setIsLoading(true);
    try {
      if (user) {
        const response = await SelfService.updateSelf({
          name: profileForm.name,
          phoneNumber: profileForm.phoneNumber || '',
        });
        if (!response.success) {
          toast.error(response.message || 'Failed to update profile');
          return;
        }
        toast.success(response.message || 'Profile updated successfully');
        setUser({
          ...user,
          name: profileForm.name,
          email: profileForm.email,
          phoneNumber: profileForm.phoneNumber || ''
        });
        
      }     
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
              />
              <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white bg-green-500`}></div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600 flex items-center justify-center md:justify-start space-x-2 mt-1">
                <Briefcase size={16} />
                <span>{user?.role}</span>
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-2 md:space-y-0 md:space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Updated {user?.updatedAt ? formatDate(user.updatedAt) : 'Never'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>Last login {user?.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-4 md:flex md:space-x-1 gap-2">
            <TabButton id="profile" label="Profile" icon={<User size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="permissions" label="Permissions" icon={<Shield size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="security" label="Security" icon={<Key size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton id="activity" label="Activity" icon={<Activity size={18} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                    <span className="hidden md:inline">Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setProfileForm({
                          name: user?.name || '',
                          email: user?.email || '',
                          phoneNumber: user?.phoneNumber || ''
                        });
                        setProfileErrors({});
                      }}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X size={16} />
                      <span className="hidden md:inline">Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading || !hasChanged()}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save size={16} />
                      <span className="hidden md:inline">{isLoading ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          profileErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {profileErrors.name && <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-900 py-2">{profileForm.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        disabled={true}
                        onChange={handleProfileInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          profileErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {profileErrors.email && <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 py-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-900">{profileForm.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileForm.phoneNumber}
                        onChange={handleProfileInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          profileErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {profileErrors.phoneNumber && <p className="mt-1 text-sm text-red-600">{profileErrors.phoneNumber}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 py-2">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-gray-900">{profileForm.phoneNumber}</span>
                    </div>
                  )}
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={profileForm.department}
                      onChange={handleProfileInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profile.department || 'Not assigned'}</p>
                  )}
                </div> */}

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={profileForm.location}
                      onChange={handleProfileInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 py-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-gray-900">{profile.location || 'Not specified'}</span>
                    </div>
                  )}
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="py-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {user?.role || null}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-6">Your Permissions</h2>
              
              {user?.permissions.includes('all') ? (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <Shield size={48} className="text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-purple-900 mb-1">Super Admin Access</h3>
                  <p className="text-purple-700">You have full access to all features and settings</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(permissionCategories).map(([key, category]) => {
                    const categoryPermissions = category.permissions.filter(p => user?.permissions.includes(p.id));
                    
                    if (categoryPermissions.length === 0) return null;
                    
                    return (
                      <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            <span className="text-sm text-gray-500">
                              {categoryPermissions.length} of {category.permissions.length} permissions
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryPermissions.map(permission => (
                              <div key={permission.id} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <Check size={16} className="text-green-600 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">{permission.name}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{permission.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                {/* Change Password Section */}
                <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-600">Manage your account password</p>
                    </div>
                    {!showPasswordForm && (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Change Password
                      </button>
                    )}
                  </div>
                  
                  {showPasswordForm && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              name="currentPassword"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordInputChange}
                              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('current')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {passwordErrors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordInputChange}
                              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('new')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordInputChange}
                              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirm')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {passwordErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                          )}
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              setPasswordErrors({});
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleChangePassword}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? 'Changing...' : 'Change Password'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Status */}
                <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Status</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Check size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Enabled</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Check size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-900">Strong Password</span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle size={16} className="text-yellow-600" />
                        <span className="text-sm font-medium text-gray-900">Login Alerts</span>
                      </div>
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Partial</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="p-3 md:p-6 max-w-4xl mx-auto">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-900">Recent Activity</h2> 
              <div className="space-y-3 md:space-y-4">
                {activities.map((activity) => {
                  const { mainAction, data } = parseDescription(activity.description);
                  
                  return (
                    <div key={activity.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="p-3 md:p-5">
                        {/* Header with action icon, main info, and timestamp */}
                        <div className="flex items-start justify-between mb-2 md:mb-3">
                          <div className="flex items-start space-x-2 md:space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 mt-0.5">
                              {getActionIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                                <h4 className="text-base md:text-lg font-medium text-gray-900 truncate">
                                  {activity.action}
                                </h4>
                                <span className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full border mt-1 sm:mt-0 self-start ${getTypeStyles(activity.type)}`}>
                                  {getTypeIcon(activity.type)}
                                  <span className="font-medium">{activity.type}</span>
                                </span>
                              </div>
                              <p className="text-gray-700 text-xs md:text-sm leading-relaxed">
                                {mainAction}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right ml-2">
                            <span className="text-xs md:text-sm text-gray-500 font-medium">
                              {formatDateTime(activity.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Module badge and ID */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center text-xs px-2 md:px-3 py-1 rounded-full border font-medium ${getModuleStyles(activity.module)}`}>
                              {activity.module}
                            </span>
                          </div>
                          
                          {/* Show ID for reference */}
                          <span className="text-xs text-gray-400 font-mono">
                            ID: {activity.id}
                          </span>
                        </div>

                        {/* Data section - collapsible or truncated for long data */}
                        {data && (
                          <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-gray-100">
                            <details className="group">
                              <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800 font-medium flex items-center space-x-1">
                                <span>View Data</span>
                                <span className="transition-transform group-open:rotate-90">▶</span>
                              </summary>
                              <div className="mt-2 p-2 md:p-3 bg-gray-50 rounded border text-xs font-mono text-gray-700 overflow-x-auto">
                                <pre className="whitespace-pre-wrap break-words">{data}</pre>
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {activities.length === 0 && (
                  <div className="text-center py-12 md:py-16">
                    <Activity size={40} className="md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                    <p className="text-sm md:text-base text-gray-500 px-4">Activity logs will appear here as actions are performed</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;