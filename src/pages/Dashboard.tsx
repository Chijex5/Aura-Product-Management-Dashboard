import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ActivityLog } from '@/stores/authStore';
import DashboardSkeleton from '@/components/loaders/DashboardSkeleton';
import { 
  Package, 
  Edit3, 
  Plus,
  TrendingUp, 
  TrendingDown,
  Clock, 
  Star,
  Calendar,
  CheckCircle,
  Award,
  Activity,
  Coffee
} from 'lucide-react';

interface User {
  admin_id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  phoneNumber: string;
  updatedAt: string;
  lastLogin: string;
  avatar: string;
}

interface PersonalStats {
  productsUpdated: number;
  ordersProcessed: number;
  tasksCompleted: number;
  streak: number;
}

interface RecentActivity {
  id: string;
  action: string;
  target: string;
  time: string;
  type: 'product' | 'order' | 'user' | 'system';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}


const Dashboard= () => {
  const { user, isLoading, activityLogs } = useAuthStore();
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [personalStats, setPersonalStats] = useState<PersonalStats>({
    productsUpdated: 12,
    ordersProcessed: 45,
    tasksCompleted: 8,
    streak: 5
  });

  const getLastWeekLogs = (activityLogs: ActivityLog[]) => {
  // Get current date
  const now = new Date();
  
  // Get the start of this week (Sunday at 00:00:00)
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);
  
  // Get the start of last week (7 days before start of this week)
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  
  // Get the end of last week (1 millisecond before start of this week)
  const endOfLastWeek = new Date(startOfThisWeek.getTime() - 1);
  
  return activityLogs.filter(log => {
    try {
      // Parse the timestamp string
      const logDate = new Date(log.timestamp);
      
      // Check if the date is valid and within last week
      return logDate >= startOfLastWeek && logDate <= endOfLastWeek;
    } catch (error) {
      // If timestamp parsing fails, exclude the log
      console.warn('Invalid timestamp format:', log.timestamp);
      return false;
    }
  });
};

  const getThisWeekLogs = (activityLogs: ActivityLog[]) => {
    // Get current date
    const now = new Date();
    
    // Get the start of this week (Sunday at 00:00:00)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get the end of this week (Saturday at 23:59:59)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return activityLogs.filter(log => {
      try {
        // Parse the timestamp string
        const logDate = new Date(log.timestamp);
        
        // Check if the date is valid and within this week
        return logDate >= startOfWeek && logDate <= endOfWeek;
      } catch (error) {
        // If timestamp parsing fails, exclude the log
        console.warn('Invalid timestamp format:', log.timestamp);
        return false;
      }
    });
  };
  const thisWeekLogs = getThisWeekLogs(activityLogs);
  const lastWeekLogs = getLastWeekLogs(activityLogs);

  const productUpdate = thisWeekLogs.filter(log => log.module.toUpperCase() === 'PRODUCT' && log.action.toUpperCase() === 'UPDATE').length;
  const lastWeekUpdate = lastWeekLogs.filter(log => log.module.toUpperCase() === 'PRODUCT' && log.action.toUpperCase() === 'UPDATE').length;

  const productCreate = thisWeekLogs.filter(log => log.module.toUpperCase() === 'PRODUCT' && log.action.toUpperCase() === 'CREATE').length;
  const lastWeekCreate = lastWeekLogs.filter(log => log.module.toUpperCase() === 'PRODUCT' && log.action.toUpperCase() === 'CREATE').length;


  const isFallingBehind = (thisWeek: number, lastWeek: number) => {
    return thisWeek <= lastWeek;
  };

  const recentActivity = [
    {
      id: '1',
      action: 'Updated product',
      target: 'Chanel No. 5',
      time: '2 hours ago',
      type: 'product'
    },
    {
      id: '2', 
      action: 'Processed order',
      target: '#ORD-1234',
      time: '4 hours ago',
      type: 'order'
    },
    {
      id: '3',
      action: 'Added new product',
      target: 'Dior Sauvage',
      time: '1 day ago',
      type: 'product'
    }
  ];

  const achievements = [
    {
      id: '1',
      title: 'Product Master',
      description: 'Updated 10+ products this week',
      icon: '📦',
      unlocked: productUpdate >= 10,
      progress: productUpdate,
      maxProgress: 10
    },
    {
      id: '2',
      title: 'Early Bird',
      description: '5 day login streak',
      icon: '🌅',
      unlocked: true
    },
    {
      id: '3',
      title: 'Order Ninja',
      description: 'Process 50 orders',
      icon: '🥷',
      unlocked: false,
      progress: 45,
      maxProgress: 50
    }
  ];

  const getGreeting = () => {
  // Get current date to ensure same greeting all day
  const today = new Date().toDateString();
  const hour = new Date().getHours();
  
  // Create a simple hash from today's date for consistent randomization
  const dateHash = today.split('').reduce((hash, char) => {
    return hash + char.charCodeAt(0);
  }, 0);
  
  let greetings = [];
  
  if (hour < 12) {
    // Morning greetings
    greetings = [
      'Good morning',
      'Rise and shine',
      'Morning sunshine',
      'Wakey wakey',
      'Fresh start',
      'New day energy',
      'Bright and early',
      'Morning champion'
    ];
  } else if (hour < 17) {
    // Afternoon greetings
    greetings = [
      'Good afternoon',
      'Afternoon delight',
      'Midday magic',
      'Sunny afternoon',
      'Afternoon warrior',
      'Peak performance time',
      'Afternoon excellence',
      'Power hour'
    ];
  } else {
    // Evening greetings
    greetings = [
      'Good evening',
      'Evening star',
      'Twilight time',
      'Evening excellence',
      'Sunset vibes',
      'Evening champion',
      'Night owl mode',
      'Evening energy'
    ];
  }
  
  // Use date hash to pick same greeting all day
  const greetingIndex = dateHash % greetings.length;
  return greetings[greetingIndex];
};

// Enhanced version with day-specific greetings
const getFunGreeting = (firstName = '') => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const hour = today.getHours();
  const dateHash = today.toDateString().split('').reduce((hash, char) => {
    return hash + char.charCodeAt(0);
  }, 0);
  
  let specialGreetings = [];
  
  // Day-specific greetings
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daySpecific = [
    'Lazy Sunday', 'Manic Monday', 'Terrific Tuesday', 'Wonderful Wednesday', 
    'Thrilling Thursday', 'Fantastic Friday', 'Super Saturday'
  ];
  
  if (hour < 12) {
    specialGreetings = [
      `Happy ${dayNames[dayOfWeek]}`,
      `${daySpecific[dayOfWeek]} vibes`,
      `Welcome back`,
      `Ready to conquer`,
      `Let's make magic`,
      `Time to shine`,
      `Another amazing day`,
      `Fresh possibilities`
    ];
  } else if (hour < 17) {
    specialGreetings = [
      `Happy ${dayNames[dayOfWeek]}`,
      `Welcome back`,
      `Crushing this ${dayNames[dayOfWeek]}`,
      `Midday momentum`,
      `Keep the energy up`,
      `Afternoon awesome`,
      `Still going strong`,
      `Powering through`
    ];
  } else {
    specialGreetings = [
      `Happy ${dayNames[dayOfWeek]} evening`,
      `Welcome back`,
      `Finishing strong`,
      `Evening productivity`,
      `Winding down well`,
      `Almost there`,
      `End on a high note`,
      `Evening excellence`
    ];
  }
  
  const greetingIndex = dateHash % specialGreetings.length;
  const greeting = specialGreetings[greetingIndex];
  
  return firstName ? `${greeting}, ${firstName}!` : `${greeting}!`;
};

// "Welcome back!" (no name needed)

  const getMotivationalMessage = () => {
    const messages = [
      "You're crushing it today! 💪",
      "Keep up the amazing work! ✨",
      "Your dedication shows! 🌟",
      "Making great progress! 🚀"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package size={16} className="text-blue-500" />;
      case 'order':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'user':
        return <Edit3 size={16} className="text-purple-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  const firstName = currentUser?.name.split(' ')[0];

  if (isLoading) {
    return <DashboardSkeleton />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20 md:pb-6">
      {/* Personal Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <img
                src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name|| "Anonymus" )}&background=4F46E5&color=fff&size=128`}
                alt={currentUser?.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-l md:text-3xl font-bold text-gray-900">
                {getFunGreeting(firstName)}
              </h1>
              <p className="md:text-l text-sm text-indigo-600 font-medium mt-1">
                {getMotivationalMessage()}
              </p>
              <p className="text-[0.8rem] md:text-sm text-gray-500 flex items-center mt-1">
                <Award size={14} className="mr-1" />
                {currentUser?.role} • Last login: {new Date(currentUser?.lastLogin || 0).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Personal Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package size={20} className="text-blue-600" />
              </div>
              {isFallingBehind(productUpdate, lastWeekUpdate) ? (
                <TrendingDown size={16} className="text-red-500" />
              ) : (
                <TrendingUp size={16} className="text-green-500" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{productUpdate}</h3>
            <p className="text-sm text-gray-600">Products Updated</p>
            <p className="text-xs text-green-600 font-medium mt-1">This week</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              {isFallingBehind(productUpdate, lastWeekUpdate) ? (
                <TrendingDown size={16} className="text-red-500" />
              ) : (
                <TrendingUp size={16} className="text-green-500" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{personalStats.ordersProcessed}</h3>
            <p className="text-sm text-gray-600">Orders Processed</p>
            <p className="text-xs text-green-600 font-medium mt-1">This month</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Plus size={20} className="text-purple-600" />
              </div>
              {isFallingBehind(productCreate, lastWeekCreate) ? (
                <TrendingDown size={16} className="text-red-500" />
              ) : (
                <TrendingUp size={16} className="text-green-500" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{productCreate}</h3>
            <p className="text-sm text-gray-600">Products Created</p>
            <p className="text-xs text-purple-600 font-medium mt-1">This week</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Coffee size={20} className="text-orange-600" />
              </div>
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{personalStats.streak}</h3>
            <p className="text-sm text-gray-600">Day Streak</p>
            <p className="text-xs text-orange-600 font-medium mt-1">Keep going!</p>
          </div>
        </div>

        {/* Recent Personal Activity */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Activity size={20} className="text-indigo-600" />
              <h2 className="font-semibold text-gray-900">Your Recent Activity</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">What you've been working on</p>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action} <span className="text-indigo-600">{activity.target}</span>
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock size={12} className="text-gray-400" />
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Achievements */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Award size={20} className="text-yellow-600" />
              <h2 className="font-semibold text-gray-900">Your Achievements</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Celebrating your milestones</p>
          </div>
          <div className="p-4 space-y-3">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="text-2xl">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </p>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  {achievement.progress && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${(achievement.progress / achievement.maxProgress!) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {achievement.progress}/{achievement.maxProgress}
                      </p>
                    </div>
                  )}
                </div>
                {achievement.unlocked && (
                  <CheckCircle size={20} className="text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="flex flex-col items-center space-y-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
              <Package size={20} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Add Product</span>
            </button>
            <button className="flex flex-col items-center space-y-2 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">Process Orders</span>
            </button>
            <button className="flex flex-col items-center space-y-2 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <Edit3 size={20} className="text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Update Inventory</span>
            </button>
            <button className="flex flex-col items-center space-y-2 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors">
              <Calendar size={20} className="text-orange-600" />
              <span className="text-sm font-medium text-gray-700">View Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;