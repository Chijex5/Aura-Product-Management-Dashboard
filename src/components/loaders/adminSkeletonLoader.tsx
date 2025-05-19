import React from 'react';

const AdminSkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {/* Header Section Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      {/* Content Section Skeleton */}
      <div className="bg-white rounded-lg shadow">
        {/* Search Bar Skeleton */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Table Skeleton */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Column Headers Skeleton */}
                {[...Array(5)].map((_, index) => (
                  <th key={index} className="px-6 py-3 text-left">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Table Rows Skeleton */}
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Admin Column Skeleton */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="ml-4 space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Role Column Skeleton */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  </td>
                  
                  {/* Permissions Column Skeleton */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {[...Array(2)].map((_, index) => (
                        <div key={index} className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </td>
                  
                  {/* Last Login Column Skeleton */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  
                  {/* Actions Column Skeleton */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-3">
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSkeletonLoader;