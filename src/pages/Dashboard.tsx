import React, { useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, ArrowUpRight, ArrowDownRight, Percent, Loader } from 'lucide-react';
import { useStatisticsStore } from '../stores/statisticsStore';
const Dashboard = () => {
  const {
    stats,
    salesData,
    categoryData,
    topProducts,
    isLoading,
    error,
    fetchStatistics
  } = useStatisticsStore();
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);
  const getStatIcon = (id: string) => {
    switch (id) {
      case 'revenue':
        return <DollarSign size={24} className="text-white" />;
      case 'orders':
        return <ShoppingBag size={24} className="text-white" />;
      case 'customers':
        return <Users size={24} className="text-white" />;
      case 'refund':
        return <Percent size={24} className="text-white" />;
      default:
        return null;
    }
  };
  const getStatColor = (id: string) => {
    switch (id) {
      case 'revenue':
        return 'bg-blue-500';
      case 'orders':
        return 'bg-green-500';
      case 'customers':
        return 'bg-purple-500';
      case 'refund':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button onClick={() => fetchStatistics()} className="mt-2 text-red-600 hover:text-red-500 font-medium text-sm">
            Try again
          </button>
        </div>
      </div>;
  }
  return <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back to your perfume store admin
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => <div key={stat.id} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${getStatColor(stat.id)}`}>
                  {getStatIcon(stat.id)}
                </div>
                <span className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change > 0 ? '+' : ''}
                  {stat.change}%
                  {stat.trend === 'up' ? <ArrowUpRight size={16} className="ml-1" /> : <ArrowDownRight size={16} className="ml-1" />}
                </span>
              </div>
              <h3 className="text-2xl font-bold">
                {stat.id === 'revenue' ? '$' : ''}
                {typeof stat.value === 'number' ? stat.value.toLocaleString(undefined, {
              minimumFractionDigits: stat.id === 'refund' ? 1 : 0,
              maximumFractionDigits: stat.id === 'refund' ? 1 : 0
            }) : stat.value}
                {stat.id === 'refund' ? '%' : ''}
              </h3>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          </div>)}
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Products</h2>
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map(product => <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`flex items-center text-sm ${product.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {product.growth >= 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                      {Math.abs(product.growth)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export default Dashboard;