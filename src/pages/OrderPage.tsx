import { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '@/utils/axios';
import { Search, Filter, Package, Clock, XCircle, Edit3, Save, X, Phone, Mail, MapPin, ChevronLeft, ChevronRight, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, Calendar, Zap, TrendingUp } from 'lucide-react';

export interface CartItem {
  id: number;
  product_name: string;
  price_per_unit: number;
  image: string;
  quantity: number;
}

export interface Order {
  order_id: string;
  user_id: number;
  status: string;
  tracking_number?: string;
  cart_items: CartItem[];
  total_amount: number;
  shipping_fee?: number;
  shipping_address: string;
  city: string;
  state: string;
  full_name: string;
  email: string;
  item_count?: number;
  phone_number: string;
  created_at: string;
  estimated_delivery?: string;
  delivered_at?: string;
  updated_at?: string;
  cancelled_at?: string;
  notes?:string;
  expected_delivery_date?: string;
  payment_status?: string;
  payment_method?: string;
  discount_code?: string;
  priority_score?: number;
  days_pending?: number;
  is_overdue?: boolean;
}

const OrderAdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Actual search query sent to backend
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string|null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingOrder, setEditingOrder] = useState<string|null>(null);
  const [editForm, setEditForm] = useState<{
    tracking_number?: string;
    estimated_delivery?: string;
    payment_status?: string;
    notes?: string;
  }>({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total_orders: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [orderBy, setOrderBy] = useState('priority');
  const [orderDirection, setOrderDirection] = useState('DESC');
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [cache, setCache] = useState<Map<string, {data: any, timestamp: number}>>(new Map());

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'success', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  ];

  const priorityOptions = [
    { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  // Calculate priority and enhanced order data
  const calculateOrderPriority = (order: any): Order => {
    const now = new Date();
    const createdAt = new Date(order.created_at);
    const expectedDelivery = order.expected_delivery_date ? new Date(order.expected_delivery_date) : null;
    
    // Calculate days pending
    const daysPending = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if overdue
    const isOverdue = expectedDelivery && now > expectedDelivery && order.status !== 'delivered';
    
    // Calculate priority score (higher = more urgent)
    let priorityScore = 0;
    
    // Overdue orders get highest priority
    if (isOverdue) {
      const daysOverdue = Math.floor((now.getTime() - expectedDelivery.getTime()) / (1000 * 60 * 60 * 24));
      priorityScore += 1000 + daysOverdue * 10;
    }
    
    // Pending orders get priority based on age
    if (order.status === 'pending') {
      if (daysPending > 7) priorityScore += 500 + daysPending * 5;
      else if (daysPending > 3) priorityScore += 300 + daysPending * 3;
      else if (daysPending > 1) priorityScore += 100 + daysPending;
    }
    
    // Processing orders get medium priority
    if (order.status === 'processing') {
      if (daysPending > 5) priorityScore += 200 + daysPending * 2;
      else priorityScore += 50 + daysPending;
    }
    
    // High-value orders get additional priority
    if (order.total_amount > 100000) priorityScore += 100;
    else if (order.total_amount > 50000) priorityScore += 50;
    
    // Payment issues add priority
    if (order.payment_status === 'failed') priorityScore += 300;
    else if (order.payment_status === 'pending') priorityScore += 150;

    return {
      ...order,
      cart_items: order.items || [],
      shipping_address: order.shipping_address,
      phone_number: order.phone_number,
      estimated_delivery: order.expected_delivery_date,
      tracking_number: order.tracking_number || '',
      priority_score: priorityScore,
      days_pending: daysPending,
      is_overdue: isOverdue
    };
  };

  // Cache key generator
  const getCacheKey = (page: number, search: string, status: string, priority: string, orderBy: string, orderDirection: string) => {
    return `${page}-${search}-${status}-${priority}-${orderBy}-${orderDirection}`;
  };

  // Fetch orders from API with caching
  const fetchOrders = useCallback(async (page = 1, search = '', status = 'all', priority = 'all', orderBy = 'priority', orderDirection = 'DESC', forceRefresh = false) => {
    try {
      const cacheKey = getCacheKey(page, search, status, priority, orderBy, orderDirection);
      const now = Date.now();
      
      // Check cache first (5 minutes TTL)
      if (!forceRefresh && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!;
        if (now - cached.timestamp < 300000) { // 5 minutes
          const transformedOrders = cached.data.orders.map(calculateOrderPriority);
          setOrders(transformedOrders);
          setPagination(cached.data.pagination);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
        order_by: orderBy === 'priority' ? 'created_at' : orderBy,
        order_direction: orderBy === 'priority' ? 'DESC' : orderDirection
      });
      
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);

      const response = await axiosInstance.get(`/admin/orders?${params}`);
      const data = response.data;

      // Cache the response
      setCache(prev => new Map(prev.set(cacheKey, { data, timestamp: now })));

      // Transform and calculate priorities
      let transformedOrders: Order[] = data.orders.map(calculateOrderPriority);
      
      // Apply priority sorting if needed
      if (orderBy === 'priority') {
        transformedOrders.sort((a, b) => {
          if (orderDirection === 'DESC') {
            return (b.priority_score || 0) - (a.priority_score || 0);
          } else {
            return (a.priority_score || 0) - (b.priority_score || 0);
          }
        });
      }

      // Apply priority filter
      if (priority !== 'all') {
        transformedOrders = transformedOrders.filter(order => {
          switch (priority) {
            case 'high':
              return (order.priority_score || 0) > 300;
            case 'medium':
              return (order.priority_score || 0) > 100 && (order.priority_score || 0) <= 300;
            case 'overdue':
              return order.is_overdue;
            case 'urgent':
              return order.status === 'pending' && (order.days_pending || 0) > 7;
            default:
              return true;
          }
        });
      }
      
      setOrders(transformedOrders);
      setPagination(data.pagination);
      setLastFetch(now);
      
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [cache, pagination.per_page]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch orders when search query or filters change
  useEffect(() => {
    fetchOrders(1, searchQuery, statusFilter, priorityFilter, orderBy, orderDirection);
  }, [searchQuery, statusFilter, priorityFilter, orderBy, orderDirection, fetchOrders]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastFetch > 120000) { // 2 minutes
        fetchOrders(pagination.current_page, searchQuery, statusFilter, priorityFilter, orderBy, orderDirection, true);
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [lastFetch, pagination.current_page, searchQuery, statusFilter, priorityFilter, orderBy, orderDirection, fetchOrders]);

  // Priority indicators
  const getPriorityIndicator = (order: Order) => {
    if (order.is_overdue) {
      return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', label: 'Overdue' };
    }
    if (order.status === 'pending' && (order.days_pending || 0) > 7) {
      return { icon: Clock, color: 'text-red-600', bg: 'bg-red-50', label: 'Urgent' };
    }
    if ((order.priority_score || 0) > 300) {
      return { icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', label: 'High' };
    }
    if ((order.priority_score || 0) > 100) {
      return { icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Medium' };
    }
    return null;
  };

  // Priority summary
  const prioritySummary = useMemo(() => {
    const overdue = orders.filter(o => o.is_overdue).length;
    const urgent = orders.filter(o => o.status === 'pending' && (o.days_pending || 0) > 7).length;
    const high = orders.filter(o => (o.priority_score || 0) > 300 && !o.is_overdue).length;
    const pending = orders.filter(o => o.status === 'pending').length;
    
    return { overdue, urgent, high, pending };
  }, [orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await axiosInstance.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus
      });

      // Clear cache and refetch
      setCache(new Map());
      fetchOrders(pagination.current_page, searchQuery, statusFilter, priorityFilter, orderBy, orderDirection, true);
      
    } catch (err) {
      setError('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order.order_id);
    setEditForm({
      tracking_number: order.tracking_number || '',
      estimated_delivery: order.estimated_delivery || '',
      payment_status: order.payment_status || 'pending',
      notes: order.notes || ''
    });
  };

  const handleSaveEdit = async (orderId: string) => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/admin/orders/${orderId}`, editForm);

      // Clear cache and refetch
      setCache(new Map());
      fetchOrders(pagination.current_page, searchQuery, statusFilter, priorityFilter, orderBy, orderDirection, true);
      
      setEditingOrder(null);
      setEditForm({});
      
    } catch (err) {
      setError('Failed to update order details');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage, searchQuery, statusFilter, priorityFilter, orderBy, orderDirection);
  };

  const handleRefresh = () => {
    setCache(new Map());
    fetchOrders(pagination.current_page, searchQuery, statusFilter, priorityFilter, orderBy, orderDirection, true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig ? statusConfig : { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = paymentStatusOptions.find(s => s.value === status);
    return statusConfig ? statusConfig : { label: status || 'Unknown', color: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-2">Error Loading Orders</h3>
          <p className="text-slate-600 mb-4 text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Enhanced Header with Priority Summary */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-slate-900">Orders</h1>
              <p className="text-xs md:text-sm text-slate-600 hidden sm:block">
                Manage and track orders • Last updated: {new Date(lastFetch).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                {pagination.total_orders}
              </div>
            </div>
          </div>

          {/* Priority Summary Cards */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
              <div className="text-red-600 font-semibold text-sm">{prioritySummary.overdue}</div>
              <div className="text-red-600 text-xs">Overdue</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
              <div className="text-orange-600 font-semibold text-sm">{prioritySummary.urgent}</div>
              <div className="text-orange-600 text-xs">Urgent</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
              <div className="text-yellow-600 font-semibold text-sm">{prioritySummary.high}</div>
              <div className="text-yellow-600 text-xs">High</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
              <div className="text-blue-600 font-semibold text-sm">{prioritySummary.pending}</div>
              <div className="text-blue-600 text-xs">Pending</div>
            </div>
          </div>

          {/* Enhanced Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders, names, emails..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm !== searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
                <select
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-xs"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <select
                className="px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-xs"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="overdue">Overdue</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
              <select
                className="px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-xs"
                value={`${orderBy}-${orderDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setOrderBy(field);
                  setOrderDirection(direction);
                }}
              >
                <option value="priority-DESC">Priority</option>
                <option value="created_at-DESC">Newest</option>
                <option value="created_at-ASC">Oldest</option>
                <option value="total_amount-DESC">High ₦</option>
                <option value="total_amount-ASC">Low ₦</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Orders List */}
      <div className="p-3 md:p-4 space-y-3">
        {orders.map((order) => {
          const priorityIndicator = getPriorityIndicator(order);
          
          return (
            <div key={order.order_id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Enhanced Order Header with Priority */}
              <div className={`p-3 ${priorityIndicator ? priorityIndicator.bg : 'bg-gradient-to-r from-slate-50 to-white'} border-b border-slate-100`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">{order.order_id}</h3>
                        {priorityIndicator && (
                          <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full ${priorityIndicator.bg}`}>
                            <priorityIndicator.icon className={`w-3 h-3 ${priorityIndicator.color}`} />
                            <span className={`text-xs font-medium ${priorityIndicator.color}`}>
                              {priorityIndicator.label}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate">{order.full_name}</p>
                      {order.days_pending && order.days_pending > 0 && (
                        <p className="text-xs text-slate-500">
                          {order.days_pending} day{order.days_pending > 1 ? 's' : ''} old
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(selectedOrder === order.order_id ? null : order.order_id)}
                    className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-1 flex-shrink-0"
                  >
                    <span>{selectedOrder === order.order_id ? 'Less' : 'More'}</span>
                    {selectedOrder === order.order_id ? 
                      <ChevronUp className="w-3 h-3" /> : 
                      <ChevronDown className="w-3 h-3" />
                    }
                  </button>
                </div>

                {/* Enhanced Status Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status).color}`}>
                      {getStatusBadge(order.status).label}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total</p>
                    <p className="font-semibold text-slate-900 text-sm">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>{formatDate(order.created_at).split(',')[0]}</span>
                  <span className={`px-2 py-0.5 rounded-full ${getPaymentStatusBadge(order.payment_status || 'pending').color}`}>
                    {getPaymentStatusBadge(order.payment_status || 'pending').label}
                  </span>
                </div>
                
                {order.is_overdue && (
                  <div className="mt-2 flex items-center space-x-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Delivery overdue</span>
                  </div>
                )}
              </div>

              {/* Enhanced Expanded Details */}
              {selectedOrder === order.order_id && (
                <div className="p-3 space-y-4">
                  {/* Quick Status Update */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700">Update Status:</label>
                      <button
                        onClick={() => handleEdit(order)}
                        className="flex items-center space-x-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium text-slate-700 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <div className="relative">
                      {updatingStatus === order.order_id && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 rounded flex items-center justify-center z-10">
                          <div className="flex items-center space-x-2 text-xs text-slate-600">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                            <span>Updating...</span>
                          </div>
                        </div>
                      )}
                      
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                        disabled={updatingStatus === order.order_id}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs appearance-none bg-white"
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {editingOrder === order.order_id && (
                    <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-900">Edit Order Details</h4>
                        <button
                          onClick={() => setEditingOrder(null)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Tracking Number
                          </label>
                          <input
                            type="text"
                            value={editForm.tracking_number || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                            placeholder="Enter tracking number"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Expected Delivery
                          </label>
                          <input
                            type="date"
                            value={editForm.estimated_delivery || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, estimated_delivery: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Payment Status
                          </label>
                          <select
                            value={editForm.payment_status || 'pending'}
                            onChange={(e) => setEditForm(prev => ({ ...prev, payment_status: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs appearance-none bg-white"
                          >
                            {paymentStatusOptions.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Notes
                          </label>
                          <textarea
                            value={editForm.notes || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs resize-none"
                            placeholder="Add notes about this order..."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingOrder(null)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(order.order_id)}
                          disabled={isSaving}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-900 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Customer Details
                      </h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-xs">
                          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600 truncate">{order.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600">{order.phone_number}</span>
                        </div>
                        <div className="flex items-start space-x-2 text-xs">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div className="text-slate-600">
                            <p>{order.shipping_address}</p>
                            <p>{order.city}, {order.state}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Order Timeline
                      </h4>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Order placed:</span>
                          <span className="font-medium text-slate-900">{formatDate(order.created_at)}</span>
                        </div>
                        
                        {order.tracking_number && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Tracking:</span>
                            <span className="font-mono text-slate-900">{order.tracking_number}</span>
                          </div>
                        )}
                        
                        {order.estimated_delivery && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Expected delivery:</span>
                            <span className={`font-medium ${order.is_overdue ? 'text-red-600' : 'text-slate-900'}`}>
                              {formatDate(order.estimated_delivery)}
                            </span>
                          </div>
                        )}
                        
                        {order.delivered_at && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Delivered:</span>
                            <span className="font-medium text-green-600">{formatDate(order.delivered_at)}</span>
                          </div>
                        )}
                        
                        {order.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                            <p className="text-yellow-800 text-xs">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-900">
                      Order Items ({order.cart_items?.length || 0})
                    </h4>
                    
                    <div className="space-y-2">
                      {order.cart_items?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-slate-600">
                              Qty: {item.quantity} × {formatCurrency(item.price_per_unit)}
                            </p>
                          </div>
                          <div className="text-xs font-medium text-slate-900">
                            {formatCurrency(item.quantity * item.price_per_unit)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Summary */}
                    <div className="border-t border-slate-200 pt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="text-slate-900">
                          {formatCurrency((order.total_amount || 0) - (order.shipping_fee || 0))}
                        </span>
                      </div>
                      {order.shipping_fee && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Shipping:</span>
                          <span className="text-slate-900">{formatCurrency(order.shipping_fee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold pt-1 border-t border-slate-100">
                        <span className="text-slate-900">Total:</span>
                        <span className="text-slate-900">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-600 mb-4">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Orders will appear here when customers place them'
              }
            </p>
            {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Enhanced Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total_orders)} of{' '}
                {pagination.total_orders} orders
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.current_page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.current_page >= pagination.total_pages - 2) {
                      pageNum = pagination.total_pages - 4 + i;
                    } else {
                      pageNum = pagination.current_page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                          pagination.current_page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderAdminDashboard;