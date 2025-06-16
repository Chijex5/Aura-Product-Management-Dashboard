import { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axios';
import { Search, Filter, Package, Clock, XCircle, Edit3, Save, X, Phone, Mail, MapPin, ChevronLeft, ChevronRight, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

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
}

const OrderAdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string|null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingOrder, setEditingOrder] = useState<string|null>(null);
  const [editForm, setEditForm] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total_orders: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [orderBy, setOrderBy] = useState('created_at');
  const [orderDirection, setOrderDirection] = useState('DESC');

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
  ];

  // Fetch orders from API
  const fetchOrders = async (page = 1, search = '', status = 'all', orderBy = 'created_at', orderDirection = 'DESC') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
        order_by: orderBy,
        order_direction: orderDirection
      });
      
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);

      const response = await axiosInstance.get(`/admin/orders?${params}`);
      const data = await response.data;

      // Transform the data to match frontend expectations
      const transformedOrders = data.orders.map(order => ({
        ...order,
        cart_items: order.items || [], // Map items to cart_items
        shipping_address: order.shipping_address,
        phone_number: order.phone_number,
        estimated_delivery: order.expected_delivery_date,
        tracking_number: order.tracking_number || ''
      }));
      
      setOrders(transformedOrders);
      setPagination(data.pagination);
      
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders(1, searchTerm, statusFilter, orderBy, orderDirection);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, orderBy, orderDirection]);

  // Filter orders locally (for search functionality)
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
                         order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      const response = await axiosInstance.patch(`/admin/orders/${orderId}/status`, {
        status: newStatus
      });

      // Update local state
      setOrders(orders.map(order => {
        if (order.order_id === orderId) {
          const updatedOrder = {
            ...order,
            status: newStatus,
            updated_at: new Date().toISOString()
          };
          
          if (newStatus === 'delivered') {
            updatedOrder.delivered_at = new Date().toISOString();
          }
          
          if (newStatus === 'cancelled') {
            updatedOrder.cancelled_at = new Date().toISOString();
          }
          
          return updatedOrder;
        }
        return order;
      }));
      
    } catch (err) {
      setError('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order.order_id);
    setEditForm({
      tracking_number: order.order_id || '',
      estimated_delivery: order.estimated_delivery || '',
      payment_status: order.payment_status || 'pending',
      notes: order.notes || ''
    });
  };

  const handleSaveEdit = async (orderId: string) => {
    try {
      setIsSaving(true);
      await axiosInstance.patch(`/admin/orders/${orderId}`, { editForm });

      // Update local state
      setOrders(orders.map(order => {
        if (order.order_id === orderId) {
          return {
            ...order,
            ...editForm,
            updated_at: new Date().toISOString()
          };
        }
        return order;
      }));
      
      setEditingOrder(null);
      setEditForm({});
      
    } catch (err) {
      setError('Failed to update order details');
    } finally{
      setIsSaving(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage, searchTerm, statusFilter, orderBy, orderDirection);
  };

  const handleRefresh = () => {
    fetchOrders(pagination.current_page, searchTerm, statusFilter, orderBy, orderDirection);
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
      {/* Mobile-Optimized Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-slate-900">Orders</h1>
              <p className="text-xs md:text-sm text-slate-600 hidden sm:block">Manage and track orders</p>
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

          {/* Mobile-Optimized Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                value={`${orderBy}-${orderDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setOrderBy(field);
                  setOrderDirection(direction);
                }}
              >
                <option value="created_at-DESC">Newest</option>
                <option value="created_at-ASC">Oldest</option>
                <option value="total_amount-DESC">High ₦</option>
                <option value="total_amount-ASC">Low ₦</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Orders List */}
      <div className="p-3 md:p-4 space-y-3">
        {filteredOrders.map((order) => (
          <div key={order.order_id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Compact Order Header */}
            <div className="p-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{order.order_id}</h3>
                    <p className="text-xs text-slate-600 truncate">{order.full_name}</p>
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

              {/* Mobile-Optimized Status Grid */}
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
            </div>

            {/* Mobile-Optimized Expanded Details */}
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
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mobile-Optimized Edit Form */}
                {editingOrder === order.order_id && (
                  <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900 text-sm">Edit Details</h4>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleSaveEdit(order.order_id)}
                          disabled={isSaving}
                          className={`flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Save className="w-3 h-3" />
                          <span>{isSaving ? 'Saving' : 'Save'}</span>
                        </button>
                        <button
                          onClick={() => setEditingOrder(null)}
                          className="flex items-center space-x-1 px-2 py-1 bg-slate-400 hover:bg-slate-500 text-white rounded text-xs font-medium transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Payment Status</label>
                        <select
                          value={editForm.payment_status}
                          onChange={(e) => setEditForm({...editForm, payment_status: e.target.value})}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {paymentStatusOptions.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Estimated Delivery</label>
                        <input
                          type="date"
                          value={editForm.estimated_delivery ? new Date(editForm.estimated_delivery).toISOString().slice(0, 10) : ''}
                          onChange={(e) => setEditForm({...editForm, estimated_delivery: e.target.value})}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile-Optimized Customer & Timeline */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-blue-600" />
                      <span>Customer</span>
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 truncate">{order.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600">{order.phone_number || 'N/A'}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div className="text-slate-600">
                          <p>{order.shipping_address}</p>
                          <p>{order.city}, {order.state}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-green-600" />
                      <span>Timeline</span>
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Created</span>
                        <span className="font-medium text-slate-900">{formatDate(order.created_at)}</span>
                      </div>
                      {order.expected_delivery_date && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Est. Delivery</span>
                          <span className="font-medium text-slate-900">{formatDate(order.expected_delivery_date)}</span>
                        </div>
                      )}
                      {order.tracking_number && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tracking</span>
                          <span className="font-medium text-blue-600">{order.tracking_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile-Optimized Order Items */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center space-x-1">
                    <Package className="w-3 h-3 text-purple-600" />
                    <span>Items ({order.item_count || order.cart_items?.length || 0})</span>
                  </h4>
                  <div className="space-y-2">
                    {order.cart_items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-xs truncate">{item.product_name || item.name}</p>
                          <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-slate-900 text-xs">{formatCurrency(item.price_per_unit || item.price)}</p>
                          <p className="text-xs text-slate-600">{formatCurrency((item.price_per_unit || item.price) * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile-Optimized Order Summary */}
                  <div className="bg-slate-50 rounded-lg p-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(order.total_amount - (order.shipping_fee || 0))}</span>
                    </div>
                    {order.shipping_fee && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Shipping</span>
                        <span className="font-medium">{formatCurrency(order.shipping_fee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold pt-1 border-t border-slate-200">
                      <span>Total</span>
                      <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Mobile-Optimized Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-white rounded-xl p-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600">
                {((pagination.current_page - 1) * pagination.per_page) + 1}-{Math.min(pagination.current_page * pagination.per_page, pagination.total_orders)} of {pagination.total_orders}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev || loading}
                  className="flex items-center space-x-1 px-2 py-1 border border-slate-200 rounded text-xs hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span className="hidden sm:block">Prev</span>
                </button>
                <span className="px-2 py-1 text-xs font-medium text-slate-700">
                  {pagination.current_page}/{pagination.total_pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next || loading}
                  className="flex items-center space-x-1 px-2 py-1 border border-slate-200 rounded text-xs hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:block">Next</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-8">
            <Package className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-600 text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderAdminDashboard;