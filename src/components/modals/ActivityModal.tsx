import { Activity, Clock, Package, User, Trash2, Edit, Plus } from 'lucide-react';
import { ActivityLog } from '@/stores/authStore';

const RecentActivity = ({ activityLogs = [] }: { activityLogs: ActivityLog[] }) => {
  // Filter out LOGIN actions and limit to recent items
  const filteredActivity = activityLogs
    .filter(log => log.action !== 'LOGIN')
    .slice(0, 8); // Show only 8 most recent non-login activities

  const getActivityIcon = (action: string, module: string) => {
    const iconClass = "w-4 h-4";
    
    switch (action) {
      case 'CREATE':
        return <Plus className={`${iconClass} text-green-600`} />;
      case 'UPDATE':
        return <Edit className={`${iconClass} text-blue-600`} />;
      case 'DELETE':
        return <Trash2 className={`${iconClass} text-red-600`} />;
      default:
        if (module === 'PRODUCT') {
          return <Package className={`${iconClass} text-purple-600`} />;
        } else if (module === 'ADMIN') {
          return <User className={`${iconClass} text-indigo-600`} />;
        }
        return <Activity className={`${iconClass} text-gray-600`} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'text-green-600';
      case 'UPDATE':
        return 'text-blue-600';
      case 'DELETE':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const extractItemName = (description: string) => {
    // Extract item name from description (e.g., "Updated product: Vanilla" -> "Vanilla")
    const match = description.match(/(?:product|admin):\s*([^|]+)/i);
    return match ? match[1].trim() : 'Unknown';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getModuleLabel = (module: string) => {
    return module.toLowerCase().charAt(0).toUpperCase() + module.toLowerCase().slice(1);
  };

  if (filteredActivity.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl w-full shadow-lg border border-white/20">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Activity size={20} className="text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Your recent work activity</p>
        </div>
        <div className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent activity to show</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Activity size={20} className="text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">Your recent work activity</p>
      </div>
      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {filteredActivity.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.action, activity.module)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getActionColor(activity.action)}`}>
                    {activity.action.toLowerCase()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {getModuleLabel(activity?.module || "info").toLowerCase()}:
                  </span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {extractItemName(activity.description)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock size={12} className="text-gray-400" />
                  <p className="text-xs text-gray-500">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {activityLogs.filter(log => log.action !== 'LOGIN').length > 8 && (
        <div className="p-3 border-t border-gray-100 text-center">
          <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;