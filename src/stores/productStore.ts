import { create } from 'zustand';

// Define interfaces for products and collections
interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  gender?: string;
  size?: string;
  brand?: string;
  image: string;
  imageId: string;
  category?: string;
  type?: string;
  bestSeller?: boolean;
}
interface CollectionProduct {
  id: number;
  name: string;
  price: number;
  type?: string;
  image: string;
}
interface Collection {
  name: string;
  description?: string;
  image: string;
  featured: boolean;
  products: Product[];
  id?: number;
}
interface StoreState {
  products: Product[];
  collections: Collection[];
  isLoading: boolean;
  error: string | null;

  // Product actions
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: number, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  setProducts: (products: Product[]) => void; // Added this method

  // Collection actions
  fetchCollections: () => Promise<void>;
  addCollection: (collection: Omit<Collection, 'id'>) => Promise<void>;
  updateCollection: (id: number, updatedCollection: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: number) => Promise<void>;

  // Utility functions
  generateImageLink: (file: File) => Promise<string>;
  setError: (error: string | null) => void;
  setIsLoading: (value: boolean) => void;
}

// Create the store without mock data
export const useStore = create<StoreState>((set, get) => ({
  // Initial empty state
  products: [],
  collections: [],
  isLoading: false,
  error: null,
  // Fetch products from API
  fetchProducts: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      // Replace with actual API call
      const response = await fetch('/api/products');
      const data = await response.json();
      set({
        products: data,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products'
      });
    }
  },
  // Product actions
  addProduct: async product => {
    set({
      isLoading: true,
      error: null
    });
    try {
      // Replace with actual API call
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      const newProduct = await response.json();
      set(state => ({
        products: [...state.products, newProduct],
        isLoading: false
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add product'
      });
    }
  },
  updateProduct: async (id, updatedProduct) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      // Replace with actual API call
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
      });
      const updated = await response.json();
      set(state => ({
        products: state.products.map(product => product.id === id ? {
          ...product,
          ...updated
        } : product),
        isLoading: false
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update product'
      });
    }
  },
  deleteProduct: async id => {
    set({
      isLoading: true,
      error: null
    });
    try {
      // Replace with actual API call
      await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      set(state => ({
        products: state.products.filter(product => product.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete product'
      });
    }
  },
  // New method to set multiple products at once
  setProducts: products => {
    set({
      products
    });
  },
  // Fetch collections from API
  fetchCollections: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      // Replace with actual API call
      const response = await fetch('/api/collections');
      const data = await response.json();
      set({
        collections: data,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch collections'
      });
    }
  },
  // Collection actions
  addCollection: async collection => {
    set({
      isLoading: true,
      error: null
    });
    try {
      // Replace with actual API call
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(collection)
      });
      const newCollection = await response.json();
      set(state => ({
        collections: [...state.collections, newCollection],
        isLoading: false
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add collection'
      });
    }
  },
  updateCollection: async (id, updatedCollection) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      // Replace with actual API call
      const response = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedCollection)
      });
      const updated = await response.json();
      set(state => ({
        collections: state.collections.map(collection => collection.id === id ? {
          ...collection,
          ...updated
        } : collection),
        isLoading: false
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update collection'
      });
    }
  },
  deleteCollection: async id => {
    set({
      isLoading: true,
      error: null
    });
    try {
      // Replace with actual API call
      await fetch(`/api/collections/${id}`, {
        method: 'DELETE'
      });
      set(state => ({
        collections: state.collections.filter(collection => collection.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete collection'
      });
    }
  },
  // Utility functions
  generateImageLink: async file => {
    // Set loading state
    set({
      isLoading: true,
      error: null
    });
    try {
      // Replace with actual API call to upload image
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      set({
        isLoading: false
      });
      return data.imageUrl;
    } catch (error) {
      // Handle error
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to upload image'
      });
      throw error;
    }
  },
  setIsLoading: value => set({
    isLoading: value
  }),
  setError: error => set({
    error
  })
}));