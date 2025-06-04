import React, { useState } from 'react';
import { Calendar, ArrowUp, ArrowDown, DollarSign, ShoppingBag, Users, Clock } from 'lucide-react';
const Statistics = () => {
  const [dateRange, setDateRange] = useState('last30');
  // Mock data for charts
  const salesData = [{
    date: 'May 1',
    sales: 1200
  }, {
    date: 'May 2',
    sales: 1500
  }, {
    date: 'May 3',
    sales: 1800
  }, {
    date: 'May 4',
    sales: 1600
  }, {
    date: 'May 5',
    sales: 2100
  }, {
    date: 'May 6',
    sales: 1900
  }, {
    date: 'May 7',
    sales: 2300
  }, {
    date: 'May 8',
    sales: 2200
  }, {
    date: 'May 9',
    sales: 2400
  }, {
    date: 'May 10',
    sales: 2000
  }];
  const categoryData = [{
    name: 'Floral',
    value: 35
  }, {
    name: 'Fresh',
    value: 25
  }, {
    name: 'Oriental',
    value: 20
  }, {
    name: 'Woody',
    value: 15
  }, {
    name: 'Citrus',
    value: 5
  }];
  const topProducts = [{
    id: 1,
    name: 'Midnight Orchid',
    sales: 124,
    revenue: 11160,
    growth: 12.5
  }, {
    id: 2,
    name: 'Ocean Breeze',
    sales: 98,
    revenue: 7399,
    growth: 5.2
  }, {
    id: 3,
    name: 'Amber Essence',
    sales: 85,
    revenue: 10200,
    growth: -2.1
  }, {
    id: 4,
    name: 'Velvet Rose',
    sales: 72,
    revenue: 6840,
    growth: 8.7
  }, {
    id: 5,
    name: 'Citrus Sunrise',
    sales: 65,
    revenue: 4290,
    growth: 3.4
  }];
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Statistics</h1>
          <p className="text-gray-500">Sales analytics and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="thisMonth">This month</option>
            <option value="lastMonth">Last month</option>
            <option value="custom">Custom range</option>
          </select>
          <button className="border border-gray-300 p-2 rounded-md hover:bg-gray-50">
            <Calendar size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500">
              <DollarSign size={20} className="text-white" />
            </div>
            <span className="flex items-center text-sm text-green-500">
              +15.2%
              <ArrowUp size={16} className="ml-1" />
            </span>
          </div>
          <h3 className="text-2xl font-bold">$24,563.00</h3>
          <p className="text-gray-500 text-sm">Total Revenue</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-500">
              <ShoppingBag size={20} className="text-white" />
            </div>
            <span className="flex items-center text-sm text-green-500">
              +8.7%
              <ArrowUp size={16} className="ml-1" />
            </span>
          </div>
          <h3 className="text-2xl font-bold">1,234</h3>
          <p className="text-gray-500 text-sm">Products Sold</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-500">
              <Users size={20} className="text-white" />
            </div>
            <span className="flex items-center text-sm text-red-500">
              -2.3%
              <ArrowDown size={16} className="ml-1" />
            </span>
          </div>
          <h3 className="text-2xl font-bold">432</h3>
          <p className="text-gray-500 text-sm">New Customers</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-amber-500">
              <Clock size={20} className="text-white" />
            </div>
            <span className="flex items-center text-sm text-green-500">
              +12.1%
              <ArrowUp size={16} className="ml-1" />
            </span>
          </div>
          <h3 className="text-2xl font-bold">18.5 min</h3>
          <p className="text-gray-500 text-sm">Avg. Session Duration</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Revenue Over Time</h2>
          </div>
          <div className="p-6">
            {/* This would be a chart in a real implementation */}
            <div className="h-64 w-full">
              <div className="flex flex-col h-full">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>$3000</span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span>$0</span>
                </div>
                <div className="flex-1 flex items-end">
                  {salesData.map((item, i) => <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full max-w-[30px] bg-blue-500 rounded-t-sm" style={{
                    height: `${item.sales / 2500 * 100}%`
                  }}></div>
                      <span className="text-xs mt-1 text-gray-500">
                        {item.date.split(' ')[1]}
                      </span>
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Sales by Category</h2>
          </div>
          <div className="p-6">
            {/* This would be a pie chart in a real implementation */}
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-sm text-gray-500">Total Sales</div>
                  </div>
                </div>
                {/* Simplified pie chart segments */}
                <div className="absolute inset-0" style={{
                background: 'conic-gradient(#3B82F6 0% 35%, #10B981 35% 60%, #8B5CF6 60% 80%, #4B5563 80% 95%, #F59E0B 95% 100%)'
              }}></div>
                <div className="absolute inset-[15%] rounded-full bg-white"></div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {categoryData.map((category, i) => <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{
                  backgroundColor: i === 0 ? '#3B82F6' : i === 1 ? '#10B981' : i === 2 ? '#8B5CF6' : i === 3 ? '#4B5563' : '#F59E0B'
                }}></div>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium">{category.value}%</span>
                </div>)}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Top Selling Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map(product => <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`flex items-center ${product.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {product.growth >= 0 ? <>
                            <ArrowUp size={14} className="mr-1" />
                            {product.growth}%
                          </> : <>
                            <ArrowDown size={14} className="mr-1" />
                            {Math.abs(product.growth)}%
                          </>}
                      </span>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export default Statistics;