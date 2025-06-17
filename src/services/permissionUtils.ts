// permissionUtils.ts
type PermissionEntry = { id: string; name: string; description: string };

interface PermissionsMap {
  [module: string]: {
    name: string;
    description: string;
    permissions: PermissionEntry[];
  };
}

export const PERMISSIONS_MAP: PermissionsMap = {
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

export const getAllPermissions = (): string[] => {
  return Object.values(PERMISSIONS_MAP)
    .flatMap(module => module.permissions)
    .map(p => p.id);
};

export const normalizePermissions = (permissions: string[]): string[] => {
  if (!Array.isArray(permissions)) return [];

  if (permissions.includes('all')) {
    return getAllPermissions();
  }

  return permissions;
};