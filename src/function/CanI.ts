/**
 * Checks if an admin has permission to perform a specific action
 * @param permission - Array of permission strings the admin has
 * @param action - The action being attempted (e.g., 'products.create')
 * @returns boolean - Whether the admin can perform the action
 */
function canI(permissions: string[], action: string): boolean {
  // If admin has 'all' permission, they can do anything
  if (permissions.includes('all')) {
    return true;
  }

  // Check if the specific permission exists in the admin's permissions
  return permissions.includes(action);
}

// Example usage:
// const adminPermissions = ['products.view', 'products.edit', 'products.create'];
// 
// // Check if admin can create a product
// const canCreateProduct = canI(adminPermissions, 'products.create'); // true
// 
// // Check if admin can delete a product
// const canDeleteProduct = canI(adminPermissions, 'products.delete'); // false