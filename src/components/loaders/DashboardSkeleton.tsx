import React from 'react';

const DashboardSkeleton = () => {
  // Skeleton component for repeated elements
  const SkeletonBox = ({ className = "", children }: { className?: string; children?: React.ReactNode }) => (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );

  const SkeletonLine = ({ width = "w-full", height = "h-4" }: { width?: string; height?: string }) => (
    <div className={`bg-gray-200 rounded ${width} ${height}`}></div>
  );

  const SkeletonCircle = ({ size = "w-4 h-4" }: { size?: string }) => (
    <div className={`bg-gray-200 rounded-full ${size}`}></div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20 md:pb-6">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <SkeletonBox>
              <div className="relative">
                <SkeletonCircle size="w-16 h-16" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-200 border-2 border-white rounded-full"></div>
              </div>
            </SkeletonBox>
            <div className="flex-1 space-y-2">
              <SkeletonBox>
                <SkeletonLine width="w-64" height="h-8" />
              </SkeletonBox>
              <SkeletonBox>
                <SkeletonLine width="w-48" height="h-5" />
              </SkeletonBox>
              <SkeletonBox>
                <SkeletonLine width="w-40" height="h-4" />
              </SkeletonBox>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <SkeletonBox className="space-y-3">
                <div className="flex items-center justify-between">
                  <SkeletonCircle size="w-10 h-10" />
                  <SkeletonCircle size="w-4 h-4" />
                </div>
                <SkeletonLine width="w-16" height="h-8" />
                <SkeletonLine width="w-full" height="h-4" />
                <SkeletonLine width="w-20" height="h-3" />
              </SkeletonBox>
            </div>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-4 border-b border-gray-100">
            <SkeletonBox className="space-y-2">
              <div className="flex items-center space-x-2">
                <SkeletonCircle size="w-5 h-5" />
                <SkeletonLine width="w-40" height="h-5" />
              </div>
              <SkeletonLine width="w-32" height="h-4" />
            </SkeletonBox>
          </div>
          <div className="divide-y divide-gray-100">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="p-4">
                <SkeletonBox>
                  <div className="flex items-center space-x-3">
                    <SkeletonCircle size="w-4 h-4" />
                    <div className="flex-1 space-y-2">
                      <SkeletonLine width="w-3/4" height="h-4" />
                      <div className="flex items-center space-x-2">
                        <SkeletonCircle size="w-3 h-3" />
                        <SkeletonLine width="w-20" height="h-3" />
                      </div>
                    </div>
                  </div>
                </SkeletonBox>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-4 border-b border-gray-100">
            <SkeletonBox className="space-y-2">
              <div className="flex items-center space-x-2">
                <SkeletonCircle size="w-5 h-5" />
                <SkeletonLine width="w-32" height="h-5" />
              </div>
              <SkeletonLine width="w-40" height="h-4" />
            </SkeletonBox>
          </div>
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <SkeletonBox>
                  <div className="flex items-center space-x-3">
                    <SkeletonCircle size="w-8 h-8" />
                    <div className="flex-1 space-y-2">
                      <SkeletonLine width="w-32" height="h-4" />
                      <SkeletonLine width="w-48" height="h-4" />
                      {index === 2 && (
                        <div className="space-y-1 mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gray-300 h-2 rounded-full w-4/5"></div>
                          </div>
                          <SkeletonLine width="w-12" height="h-3" />
                        </div>
                      )}
                    </div>
                    <SkeletonCircle size="w-5 h-5" />
                  </div>
                </SkeletonBox>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
          <SkeletonBox className="mb-3">
            <SkeletonLine width="w-24" height="h-5" />
          </SkeletonBox>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <SkeletonBox>
                  <div className="flex flex-col items-center space-y-2">
                    <SkeletonCircle size="w-5 h-5" />
                    <SkeletonLine width="w-16" height="h-4" />
                  </div>
                </SkeletonBox>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;