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
  return permissions.includes(action);
}
export default canI;