import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface StatItem {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}
interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}
interface CategoryData {
  name: string;
  value: number;
  color: string;
}
interface TopProduct {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}
interface StatisticsStore {
  stats: StatItem[];
  salesData: SalesData[];
  categoryData: CategoryData[];
  topProducts: TopProduct[];
  isLoading: boolean;
  error: string | null;
  setStats: (stats: StatItem[]) => void;
  setSalesData: (data: SalesData[]) => void;
  setCategoryData: (data: CategoryData[]) => void;
  setTopProducts: (products: TopProduct[]) => void;
  fetchStatistics: () => Promise<void>;
  setIsLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
}
// Mock data generator functions
const generateMockStats = (): StatItem[] => [{
  id: 'revenue',
  label: 'Total Revenue',
  value: 24563.45,
  change: 12.5,
  trend: 'up'
}, {
  id: 'orders',
  label: 'Products Sold',
  value: 1234,
  change: 18.2,
  trend: 'up'
}, {
  id: 'customers',
  label: 'New Customers',
  value: 432,
  change: -3.5,
  trend: 'down'
}, {
  id: 'refund',
  label: 'Refund Rate',
  value: 0.8,
  change: -1.2,
  trend: 'down'
}];
const generateMockSalesData = (): SalesData[] => {
  const dates = Array.from({
    length: 30
  }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });
  return dates.map(date => ({
    date,
    revenue: Math.floor(1000 + Math.random() * 2000),
    orders: Math.floor(50 + Math.random() * 100)
  }));
};
const generateMockCategoryData = (): CategoryData[] => [{
  name: 'Floral',
  value: 35,
  color: '#3B82F6'
}, {
  name: 'Fresh',
  value: 25,
  color: '#10B981'
}, {
  name: 'Oriental',
  value: 20,
  color: '#8B5CF6'
}, {
  name: 'Woody',
  value: 15,
  color: '#4B5563'
}, {
  name: 'Citrus',
  value: 5,
  color: '#F59E0B'
}];
const generateMockTopProducts = (): TopProduct[] => [{
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
export const useStatisticsStore = create<StatisticsStore>()(persist(set => ({
  stats: [],
  salesData: [],
  categoryData: [],
  topProducts: [],
  isLoading: false,
  error: null,
  setStats: stats => set({
    stats
  }),
  setSalesData: data => set({
    salesData: data
  }),
  setCategoryData: data => set({
    categoryData: data
  }),
  setTopProducts: products => set({
    topProducts: products
  }),
  setIsLoading: value => set({
    isLoading: value
  }),
  setError: error => set({
    error
  }),
  fetchStatistics: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Generate mock data
      const stats = generateMockStats();
      const salesData = generateMockSalesData();
      const categoryData = generateMockCategoryData();
      const topProducts = generateMockTopProducts();
      set({
        stats,
        salesData,
        categoryData,
        topProducts,
        isLoading: false
      });
    } catch (error) {
      set({
        error: 'Failed to fetch statistics',
        isLoading: false
      });
    }
  }
}), {
  name: 'statistics-storage'
}));