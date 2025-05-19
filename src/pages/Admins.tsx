import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Loader, Check, X, AlertTriangle } from 'lucide-react';
import useAdminApi from '@/hooks/useAdminApi';
import { useAuth } from '@/contexts/AuthContext';
import AdminSkeletonLoader from '@/components/loaders/adminSkeletonLoader';
import { toast } from 'react-hot-toast';

const Admins = () => {
  const { admins, isLoading, error, loadAdmins, deleteAdmin, createAdmin, updateAdmin } = useAdminApi();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    permissions: []
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Load admins on component mount
  useEffect(() => {
    loadAdmins(user.permissions);
  }, []);

  // Available permissions by category
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

  // Predefined roles
  const roles = [
    {
      name: 'Super Admin',
      description: 'Full access to all features and settings',
      permissions: ['all']
    }, 
    {
      name: 'Product Manager',
      description: 'Manage products and inventory',
      permissions: ['products.view', 'products.edit', 'products.create', 'products.delete', 'products.inventory', 'products.pricing']
    }, 
    {
      name: 'Analytics',
      description: 'View statistics and reports',
      permissions: ['analytics.view', 'analytics.export']
    }, 
    {
      name: 'Support',
      description: 'Handle customer service and resources',
      permissions: ['products.view', 'users.view']
    }
  ];

  interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    permissions: string[];
  }

  interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    permissions?: string;
    [key: string]: string | undefined;
  }

  interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement | HTMLSelectElement> {}

  const handleInputChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({
      ...prev,
      [name]: value
    }));
  };

  interface HandlePermissionChange {
    (permissionId: string): void;
  }

  const handlePermissionChange: HandlePermissionChange = (permissionId) => {
    setFormData((prev: FormData) => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p: string) => p !== permissionId)
        : [...prev.permissions, permissionId];
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  interface Role {
    name: string;
    description: string;
    permissions: string[];
  }

  interface RoleChangeEvent extends React.ChangeEvent<HTMLSelectElement> {}

  const handleRoleChange = (e: RoleChangeEvent) => {
    const roleName = e.target.value;
    const selectedRole: Role | undefined = roles.find((role: Role) => role.name === roleName);

    setFormData({
      ...formData,
      role: roleName,
      permissions: selectedRole ? [...selectedRole.permissions] : []
    });
  };

  interface SearchEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleSearch = (e: SearchEvent) => {
    setSearchQuery(e.target.value);
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateForm = () => {
    const errors: FormErrors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) errors.email = 'Valid email is required';
    
    if (formData.password === '' && !selectedAdmin) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8 && !selectedAdmin) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword && !selectedAdmin) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) errors.role = 'Role is required';
    if (formData.permissions.length === 0) errors.permissions = 'At least one permission is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      const adminData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        permissions: formData.permissions
      };
      
      if (selectedAdmin) {
        const ItWent = await updateAdmin(Number(selectedAdmin.id), user.permissions, adminData);
        if(ItWent?.success) {
          toast.success(ItWent.message);
          setShowAddModal(false);
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
            permissions: []
          });
          setSelectedAdmin(null);
          loadAdmins(user.permissions);
        }else{
          toast.error(ItWent?.message)
        }
      } else {
        const ItWent = await createAdmin(adminData, user.permissions);
        if(ItWent?.success) {
          toast.success(ItWent.message);
          setShowAddModal(false);
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
            permissions: []
          });
          setSelectedAdmin(null);
          loadAdmins(user.permissions);
        } else{
          toast.error(ItWent?.message)
        }
      }
      
    } catch (error) {
      console.error('Failed to save admin:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  type Admin = {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: string;
    permissions: string[];
    avatar?: string;
    lastLogin?: string;
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      confirmPassword: '',
      role: admin.role,
      permissions: admin.permissions
    });
    setShowAddModal(true);
  };

  const handleDeleteAdmin = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      if (id === user.admin_id) {
        toast.error('You cannot delete your own account');
        return;
      }
      try {
        const deleted = await deleteAdmin(id, user.permissions);
        if(deleted.success) {
          toast.success(deleted.message);
          loadAdmins(user.permissions);
        } else {
          toast.error(deleted.message)
        }
      } catch (error) {
        console.error('Failed to delete admin:', error);
      }
    }
  };

  const openAddModal = () => {
    setSelectedAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      permissions: []
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Helper function to get all permission IDs
  const getAllPermissionIds = () => {
    return Object.values(permissionCategories)
      .flatMap(category => category.permissions)
      .map(permission => permission.id);
  };

  // Count active permissions by category
  const countActivePermissionsByCategory = (permissions) => {
    const result = {};
    
    Object.entries(permissionCategories).forEach(([key, category]) => {
      const categoryPermissionIds = category.permissions.map(p => p.id);
      const activeCount = categoryPermissionIds.filter(id => permissions.includes(id)).length;
      result[key] = {
        active: activeCount,
        total: categoryPermissionIds.length
      };
    });
    
    return result;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="text-gray-500">Manage admin users and permissions</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" />
          <span className = "hidden md:block">Add Admin</span>
        </button>
      </div>
      
      {isLoading ? (
        <AdminSkeletonLoader />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Error loading admins: {error}</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search admins..." 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map(admin => {
                    const permissionCounts = countActivePermissionsByCategory(admin.permissions);
                    
                    return (
                      <tr key={admin.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full" src={admin.avatar} alt={admin.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {admin.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {admin.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {admin.permissions.includes('all') ? (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-md">
                              All permissions
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(permissionCounts).map(([category, counts]) => (
                                counts.active > 0 && (
                                  <span key={category} className="px-2 py-1 text-xs bg-gray-100 rounded-md flex items-center">
                                    {permissionCategories[category].name}: {counts.active}/{counts.total}
                                  </span>
                                )
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => handleEditAdmin(admin)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Admin Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">
                {selectedAdmin ? `Edit Admin: ${selectedAdmin.name}` : 'Add New Admin'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`} 
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {selectedAdmin && '(Leave blank to keep current)'}
                    </label>
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select 
                      name="role"
                      value={formData.role}
                      onChange={handleRoleChange}
                      className={`w-full border ${formErrors.role ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Select a role</option>
                      {roles.map((role, index) => (
                        <option key={index} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.role && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
                    <div className="flex items-center space-x-2">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, permissions: getAllPermissionIds()})}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md"
                      >
                        Select All
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, permissions: []})}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  {formErrors.permissions && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                      {formErrors.permissions}
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-6">
                      {Object.entries(permissionCategories).map(([key, category]) => (
                        <div key={key} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-800">{category.name}</h4>
                            <p className="text-sm text-gray-500">{category.description}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {category.permissions.map((permission) => (
                              <div key={permission.id} className="flex items-start p-3 bg-white border border-gray-200 rounded-md hover:border-blue-300 transition-all">
                                <div className="flex items-center h-5">
                                  <input 
                                    id={permission.id} 
                                    type="checkbox" 
                                    checked={formData.permissions.includes(permission.id)}
                                    onChange={() => handlePermissionChange(permission.id)}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                                  />
                                </div>
                                <div className="ml-3 text-sm flex-1">
                                  <label htmlFor={permission.id} className="font-medium text-gray-700 block">
                                    {permission.name}
                                  </label>
                                  <p className="text-gray-500">
                                    {permission.description}
                                  </p>
                                </div>
                                {formData.permissions.includes(permission.id) && (
                                  <Check size={16} className="text-green-500 ml-2" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                >
                  {isSubmitting? <span className="flex items-center"> <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" /> {selectedAdmin ? 'Updating admin...' : 'Creating admin...'} </span> : selectedAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;