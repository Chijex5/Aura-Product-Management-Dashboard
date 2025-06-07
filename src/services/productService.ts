import axiosInstance, { uploadFile } from '@/utils/axios';
import { useStore } from '@/stores/productStore';
import canI from '@/function/CanI';

export interface ProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  gender: string;
  size: string;
  brand: string;
  image: string;
  type: string;
  imageId: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  gender: string;
  size: string;
  brand: string;
  image: string;
  type: string;
  imageId: string;
  best_seller: boolean;
}

// Cache configuration
const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  MAX_SIZE: 100 // Maximum number of cached entries
};

// Cache storage
interface CacheEntry {
  data: any;
  timestamp: number;
  key: string;
}

class ProductCache {
  private cache = new Map<string, CacheEntry>();
  private lastFetchTime = 0;
  private isFetching = false;

  private generateCacheKey(permissions: string[]): string {
    return `products_${permissions.sort().join('_')}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > CACHE_CONFIG.TTL;
  }

  private cleanup(): void {
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // If cache is still too large, remove oldest entries
    if (this.cache.size > CACHE_CONFIG.MAX_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.cache.size - CACHE_CONFIG.MAX_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  get(permissions: string[]): CacheEntry | null {
    const key = this.generateCacheKey(permissions);
    const entry = this.cache.get(key);
    
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  set(permissions: string[], data: any): void {
    const key = this.generateCacheKey(permissions);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      key
    };
    
    this.cache.set(key, entry);
    this.cleanup();
  }

  invalidate(permissions?: string[]): void {
    if (permissions) {
      const key = this.generateCacheKey(permissions);
      this.cache.delete(key);
    } else {
      // Clear all product-related cache
      this.cache.clear();
    }
  }

  setFetchingState(isFetching: boolean): void {
    this.isFetching = isFetching;
    if (isFetching) {
      this.lastFetchTime = Date.now();
    }
  }

  shouldFetch(permissions: string[], forceRefresh = false): boolean {
    if (forceRefresh) return true;
    if (this.isFetching) return false;
    
    const cached = this.get(permissions);
    if (!cached) return true;
    
    // Check if cached data is empty or invalid
    if (!cached.data || !cached.data.productList || cached.data.productList.length === 0) {
      return true;
    }
    
    return false;
  }

  invalidateOnError(permissions: string[]): void {
    const key = this.generateCacheKey(permissions);
    this.cache.delete(key);
    this.isFetching = false;
  }

  clear(): void {
    this.cache.clear();
    this.lastFetchTime = 0;
    this.isFetching = false;
  }
}

// Global cache instance
const productCache = new ProductCache();

const transformProductData = (productData: ProductResponse) => {
  return {
    id: productData.id,
    name: productData.name,
    description: productData.description,
    price: productData.price,
    stock: productData.stock,
    gender: productData.gender,
    size: productData.size,
    brand: productData.brand,
    image: productData.image,
    type: productData.type,
    imageId: productData.imageId,
    bestSeller: productData.best_seller
  };
};

export const productService = {
  fetchProducts: async (permissions: string[], forceRefresh = false) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.view');
    
    if (!ICan) {
      store.setError('You do not have permission to view products');
      return {
        success: false,
        message: "You do not have permission to view product list"
      };
    }

    // Check current store state - if products are empty, force fetch
    const currentProducts = store.products || [];
    const shouldForceRefresh = forceRefresh || currentProducts.length === 0;

    // Check cache first
    if (!productCache.shouldFetch(permissions, shouldForceRefresh)) {
      const cached = productCache.get(permissions);
      if (cached && cached.data && cached.data.productList && cached.data.productList.length > 0) {
        // Update store with cached data without loading state
        const transformedProducts = cached.data.productList.map((product: ProductResponse) => transformProductData(product));
        store.setProducts(transformedProducts);
        return cached.data;
      }
    }

    try {
      productCache.setFetchingState(true);
      store.setIsLoading(true);
      store.setError(null);
      
      const response = await axiosInstance.get('/product/list');
      
      if (response.data && response.data.productList) {
        // Transform and store products
        const transformedProducts = response.data.productList.map((product: ProductResponse) => transformProductData(product));
        store.setProducts(transformedProducts);
        
        // Only cache if we have actual data
        if (response.data.productList.length > 0) {
          productCache.set(permissions, response.data);
        }
      } else {
        // If response is empty or invalid, don't cache it
        productCache.invalidateOnError(permissions);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch products';
      store.setError(errorMessage);
      
      // Clear cache on error so next attempt will try API again
      productCache.invalidateOnError(permissions);
      
      throw error;
    } finally {
      store.setIsLoading(false);
      productCache.setFetchingState(false);
    }
  },

  createProduct: async (permissions: string[], productData: ProductData) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.create');
    
    if (!ICan) {
      store.setError('You do not have permission to view products');
      return {
        success: false,
        message: "You do not have permission to view product list"
      };
    }
    
    try {
      store.setIsLoading(true);
      store.setError(null);
      
      const response = await axiosInstance.post('/product/create', productData);
      
      // Invalidate cache after creating new product
      productCache.invalidate();
      
      await productService.fetchProducts(permissions, true); // Force refresh
      
      return {
        success: true,
        message: "created product successfully",
        data: response.data
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch products';
      store.setError(errorMessage);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  },

  updateProduct: async (id: number, permissions: string[], updates: Partial<ProductData>) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.edit');
    
    if (!ICan) {
      store.setError("You are not allowed to edit products");
      return {
        success: false,
        message: "Not enough permissions to edit products"
      };
    }
    
    try {
      store.setIsLoading(true);
      store.setError(null);
      
      const response = await axiosInstance.put(`/products/update/${id}`, updates);
      
      if (response.status == 200 && response.data) {
        const updatedProduct = transformProductData(response.data.product);
        store.updateProduct(id, updatedProduct);
        
        // Invalidate cache after updating product
        productCache.invalidate();
        
        return {
          success: true,
          message: 'Updated product successfully',
          data: response.data
        };
      } else {
        return {
          success: false,
          message: "failed to Update producs"
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to Update products';
      store.setError(errorMessage);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  },

  deleteProduct: async (id: number, permissions: string[]) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.delete');
    
    if (!ICan) {
      store.setError("You do not have permission to delete products");
      return {
        success: false,
        message: "You do not have permission to delete products"
      };
    }
    
    try {
      store.setIsLoading(true);
      store.setError(null);
      
      const response = await axiosInstance.delete(`/products/delete/${id}`);
      
      if (response.status == 200) {
        store.deleteProduct(id);
        
        // Invalidate cache after deleting product
        productCache.invalidate();
        
        return {
          success: true,
          message: "Product deleted successfully"
        };
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete products';
      store.setError(errorMessage);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  },

  generateImageLink: async (file: File, permissions: string[]) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.edit');
    
    if (!ICan) {
      store.setError("You are not allowed to edit products");
      return {
        success: false,
        message: "Not enough permissions to edit products"
      };
    }
    
    try {
      store.setIsLoading(true);
      store.setError(null);
      
      const response = await uploadFile('/upload-image', file);
      
      if (response.status == 201 && response.data) {
        return {
          success: true,
          image: response.data.image_url,
          imageId: response.data.public_id,
          message: response.data.message
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to Upload image';
      store.setError(errorMessage);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  },

  deleteImageLink: async (imageId: string, permissions: string[]) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.edit');
    
    if (!ICan) {
      store.setError("You do not have permission to delete products");
      return {
        success: false,
        message: "You do not have permission to edit products"
      };
    }
    
    try {
      store.setIsLoading(true);
      store.setError(null);
      
      const response = await axiosInstance.delete(`/delete-image/${imageId}`);
      
      if (response.status == 200) {
        return {
          success: true,
          message: "Image removed successfully"
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to Update products';
      store.setError(errorMessage);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  },

  // Utility methods for cache management
  clearCache: () => {
    productCache.clear();
  },

  refreshProducts: async (permissions: string[]) => {
    return await productService.fetchProducts(permissions, true);
  }
};

export default productService;