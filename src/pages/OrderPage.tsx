import { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axios';
import { Search, Filter, Package, Clock, XCircle, Edit3, Save, X, Phone, Mail, MapPin, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Orders</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-sm md:text-2xl font-bold text-slate-900">Order Management</h1>
              <p className="text-slate-600 hidden md:block md:text-sm">Manage orders, track status, and update details</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="bg-blue-50 text-blue-700 text-[0.7125rem] md:text-sm px-3 py-1 rounded-full text-sm font-medium">
                {pagination.total_orders} Orders
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
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
                className="px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[120px]"
                value={`${orderBy}-${orderDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setOrderBy(field);
                  setOrderDirection(direction);
                }}
              >
                <option value="created_at-DESC">Newest First</option>
                <option value="created_at-ASC">Oldest First</option>
                <option value="total_amount-DESC">Highest Amount</option>
                <option value="total_amount-ASC">Lowest Amount</option>
                <option value="status-ASC">Status A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.order_id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Order Header */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{order.order_id}</h3>
                    <p className="text-sm text-slate-600">{order.full_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(selectedOrder === order.order_id ? null : order.order_id)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  {selectedOrder === order.order_id ? 'Collapse' : 'Details'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status).color}`}>
                    {getStatusBadge(order.status).label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Payment</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(order.payment_status || 'pending').color}`}>
                    {getPaymentStatusBadge(order.payment_status || 'pending').label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(order.total_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Created</p>
                  <p className="text-sm text-slate-700">{formatDate(order.created_at).split(',')[0]}</p>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedOrder === order.order_id && (
              <div className="p-4 space-y-6">
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-slate-700">Status:</label>
                    <div className="relative">
                      {updatingStatus === order.order_id && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center z-10">
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                            <span>Updating status...</span>
                          </div>
                        </div>
                      )}
                      
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                        disabled={updatingStatus === order.order_id}
                        className={`
                          px-3 py-1.5 border border-slate-200 rounded-lg text-sm w-full
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200
                          ${updatingStatus === order.order_id ? 'pointer-events-none' : ''}
                        `}
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(order)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Edit Form */}
                {editingOrder === order.order_id && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">Edit Order Details</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(order.order_id)}
                          disabled={isSaving}
                          className={`flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSaving ? 'Saving' : 'Save'}</span>
                        </button>
                        <button
                          onClick={() => setEditingOrder(null)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-400 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tracking Number</label>
                        <input
                          type="text"
                          disabled
                          value={editForm.tracking_number}
                          onChange={(e) => setEditForm({...editForm, tracking_number: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter tracking number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Payment Status</label>
                        <select
                          value={editForm.payment_status}
                          onChange={(e) => setEditForm({...editForm, payment_status: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {paymentStatusOptions.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Delivery</label>
                        <input
                          type="date"
                          value={editForm.estimated_delivery ? new Date(editForm.estimated_delivery).toISOString().slice(0, 10) : ''}
                          onChange={(e) => setEditForm({...editForm, estimated_delivery: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-3 h-3 text-blue-600" />
                      </div>
                      <span>Customer Details</span>
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{order.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{order.phone_number || 'N/A'}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="text-slate-600">
                          <p>{order.shipping_address}</p>
                          <p>{order.city}, {order.state}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-3 h-3 text-green-600" />
                      </div>
                      <span>Order Timeline</span>
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-500">Created</p>
                        <p className="font-medium text-slate-900">{formatDate(order.created_at)}</p>
                      </div>
                      {order.expected_delivery_date && (
                        <div>
                          <p className="text-slate-500">Est. Delivery</p>
                          <p className="font-medium text-slate-900">{formatDate(order.expected_delivery_date)}</p>
                        </div>
                      )}
                      {order.delivered_at && (
                        <div>
                          <p className="text-slate-500">Delivered</p>
                          <p className="font-medium text-green-600">{formatDate(order.delivered_at)}</p>
                        </div>
                      )}
                      {order.cancelled_at && (
                        <div>
                          <p className="text-slate-500">Cancelled</p>
                          <p className="font-medium text-red-600">{formatDate(order.cancelled_at)}</p>
                        </div>
                      )}
                      {order.tracking_number && (
                        <div>
                          <p className="text-slate-500">Tracking</p>
                          <p className="font-medium text-blue-600">{order.tracking_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-3 h-3 text-purple-600" />
                    </div>
                    <span>Order Items ({order.item_count || order.cart_items?.length || 0})</span>
                  </h4>
                  <div className="space-y-3">
                    {order.cart_items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{item.product_name || item.name}</p>
                          <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{formatCurrency(item.price_per_unit || item.price)}</p>
                          <p className="text-sm text-slate-600">{formatCurrency((item.price_per_unit || item.price) * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(order.total_amount - (order.shipping_fee || 0))}</span>
                    </div>
                    {order.shipping_fee && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Shipping</span>
                        <span className="font-medium">{formatCurrency(order.shipping_fee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total_orders)} of {pagination.total_orders} orders
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.has_prev || loading}
                className="flex items-center space-x-1 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <span className="px-3 py-2 text-sm font-medium text-slate-700">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next || loading}
                className="flex items-center space-x-1 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderAdminDashboard;