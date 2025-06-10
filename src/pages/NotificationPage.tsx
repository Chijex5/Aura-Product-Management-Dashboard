import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Notification } from '@/stores/authStore';
import SelfService from '@/services/selfService';
import toast from 'react-hot-toast';
import { 
  Bell, 
  Package, 
  ShoppingCart, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  X, 
  Settings,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  Clock,
  Star,
  User,
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';
import { use } from 'framer-motion/client';

const NotificationPage = () => {
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false)
  const { notifications, setNotifications } = useAuthStore();
  const [loading, setLoading] = useState<{id: number | null, state: boolean}>({id: null, state: false});
  const getNotificationIcon = (type: string) => {
    const iconSize = 20;
    switch (type) {
      case 'achievement':
        return <Award size={iconSize} className="text-yellow-600" />;
      case 'order':
        return <ShoppingCart size={iconSize} className="text-green-600" />;
      case 'product':
        return <Package size={iconSize} className="text-blue-600" />;
      case 'success':
        return <CheckCircle size={iconSize} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={iconSize} className="text-orange-600" />;
      case 'error':
        return <AlertCircle size={iconSize} className="text-red-600" />;
      case 'system':
        return <Settings size={iconSize} className="text-purple-600" />;
      default:
        return <Info size={iconSize} className="text-blue-600" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    const opacity = read ? '50' : '100';
    switch (type) {
      case 'achievement':
        return `bg-gradient-to-r from-yellow-${opacity} to-orange-${opacity}`;
      case 'order':
        return `bg-gradient-to-r from-green-${opacity} to-emerald-${opacity}`;
      case 'product':
        return `bg-gradient-to-r from-blue-${opacity} to-indigo-${opacity}`;
      case 'success':
        return `bg-gradient-to-r from-green-${opacity} to-teal-${opacity}`;
      case 'warning':
        return `bg-gradient-to-r from-orange-${opacity} to-red-${opacity}`;
      case 'error':
        return `bg-gradient-to-r from-red-${opacity} to-pink-${opacity}`;
      case 'system':
        return `bg-gradient-to-r from-purple-${opacity} to-indigo-${opacity}`;
      default:
        return `bg-gradient-to-r from-blue-${opacity} to-cyan-${opacity}`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'medium':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>;
      case 'low':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      default:
        return null;
    }
  };

  const markAsRead = async(id: number) => {
    try{
      setLoading({id, state: true});
      const response = await SelfService.markNotificationAsRead(id);
      if (response.success) {
        const updatedNotifications = notifications.map((notif: Notification) => 
          notif.id === id ? { ...notif, read: true } : notif
        );
        setNotifications(updatedNotifications);
        toast.success(response.message);
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
    } finally{
      setLoading({id: null, state: false});
    }
  };

  const markAllAsRead = async() => {
    try{  
      setIsLoading(true)
      const response = await SelfService.markAllNotificationsAsRead();
      if (response.success){
        const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
        setNotifications(updatedNotifications);
        toast.success(response.message);
      } else{
        toast.error(response.message);
      }
    } catch (err){
      console.log("error marhing all as read", err)
    } finally{
      setIsLoading(false);
    }
  };
  const deleteNotification = async (id: number) => {
    try{ 
      setLoading({id, state:true}) 
      const response = await SelfService.deleteNotification(id);
      if (response.success){
        const updatedNotifications = notifications.filter(notif => notif.id !== id);
        setNotifications(updatedNotifications);
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error("error deleting the notification:", err);
    } finally{
      setLoading({id:null, state:false}) 
    }
  };
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    if (filter === 'action') return notif.actionRequired;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'action', label: 'Action Required', count: actionRequiredCount },
    { value: 'achievement', label: 'Achievements', count: notifications.filter(n => n.type === 'achievement').length },
    { value: 'order', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
    { value: 'product', label: 'Products', count: notifications.filter(n => n.type === 'product').length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Bell size={24} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-l md:text-3xl font-bold text-gray-900">
                  Notifications
                </h1>
                <p className="text-[0.8rem] md:text-sm md:text-base text-indigo-600 font-medium">
                  Stay updated with your latest activities
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{unreadCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <Bell size={16} className="text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Total</span>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{notifications.length}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <EyeOff size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Unread</span>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{unreadCount}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-red-600" />
                <span className="text-sm font-medium text-gray-700">Action</span>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{actionRequiredCount}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/20">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Today</span>
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {
                  notifications.filter(n => {
                    const notifDate = new Date(n.timestamp);
                    const today = new Date();

                    return (
                      notifDate.getFullYear() === today.getFullYear() &&
                      notifDate.getMonth() === today.getMonth() &&
                      notifDate.getDate() === today.getDate()
                    );
                  }).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>
                {unreadCount > 0 && (
                <button
                disabled={isLoading}
                onClick={markAllAsRead}
                className="fixed right-5 z-50 bottom-5 px-3 py-1 text-[0.7rem] md:text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  {isLoading ? "Working" : "Mark all read"}
                </button>
              )}
      <div className="px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <h2 className="font-semibold text-gray-900">Filter Notifications</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {option.label}
                  {option.count > 0 && (
                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                      filter === option.value
                        ? 'bg-white text-indigo-600'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bell size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">There are no notifications matching your current filter.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${loading.state && loading.id === notification.id ? 'bg-gray-200' : 'bg-white/90'} backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden transition-all duration-200 hover:shadow-xl ${
                  !notification.read ? 'ring-2 ring-indigo-100' : ''
                }`}
              >
                <div className="flex">
                  {/* Priority Indicator */}
                  <div className={`w-1 ${
                    notification.priority === 'high' ? 'bg-red-500' :
                    notification.priority === 'medium' ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}></div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${
                        notification.type === 'achievement' ? 'bg-yellow-100' :
                        notification.type === 'order' ? 'bg-green-100' :
                        notification.type === 'product' ? 'bg-blue-100' :
                        notification.type === 'success' ? 'bg-green-100' :
                        notification.type === 'warning' ? 'bg-orange-100' :
                        notification.type === 'error' ? 'bg-red-100' :
                        notification.type === 'system' ? 'bg-purple-100' :
                        'bg-blue-100'
                      } flex-shrink-0`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`font-semibold ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h3>
                              {notification.actionRequired && (
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                                  Action Required
                                </span>
                              )}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                              )}
                            </div>
                            <p className={`text-sm ${
                              notification.read ? 'text-gray-500' : 'text-gray-700'
                            } mb-2`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span>{notification.timestamp}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {getPriorityBadge(notification.priority)}
                                <span className="capitalize">{notification.priority} priority</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          {!loading.state && loading.id !== notification.id && (
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <Eye size={16} className="text-gray-500" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                title="Delete notification"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Notification Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="flex items-center justify-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
              <Settings size={20} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Notification Settings</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">Mark All Read</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <Calendar size={20} className="text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Schedule Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;