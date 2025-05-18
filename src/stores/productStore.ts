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
  category?: string;
  type?: string;
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
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, updatedProduct: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  
  // Collection actions
  addCollection: (collection: Omit<Collection, 'id'>) => void;
  updateCollection: (id: number, updatedCollection: Partial<Collection>) => void;
  deleteCollection: (id: number) => void;
  
  // Utility functions
  generateImageLink: (file: File) => Promise<string>;
}

// Initial mock data for products
const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Midnight Orchid',
    description: 'A premium feminine fragrance by Chanel. Available in 50ml.',
    price: 89.99,
    stock: 24,
    gender: 'Feminine',
    size: '50ml',
    brand: 'Chanel',
    category: 'Floral',
    image: 'https://images.unsplash.com/photo-1592914610354-fd354de21e5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
  },
  {
    id: 2,
    name: 'Ocean Breeze',
    description: 'A premium masculine fragrance by Hugo Boss. Available in 100ml.',
    price: 75.5,
    stock: 18,
    gender: 'Masculine',
    size: '100ml',
    brand: 'Hugo Boss',
    category: 'Fresh',
    image: 'https://images.unsplash.com/photo-1547887538-6b3c3c4560d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
  },
  {
    id: 3,
    name: 'Amber Essence',
    description: 'A premium unisex fragrance by Tom Ford. Available in 50ml.',
    price: 120.0,
    stock: 12,
    gender: 'Unisex',
    size: '50ml',
    brand: 'Tom Ford',
    category: 'Oriental',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
  },
  {
    id: 4,
    name: 'Citrus Sunrise',
    description: 'A premium unisex fragrance by Versace. Available in 30ml.',
    price: 65.99,
    stock: 32,
    gender: 'Unisex',
    size: '30ml',
    brand: 'Versace',
    category: 'Citrus',
    image: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
  },
  {
    id: 5,
    name: 'Velvet Rose',
    description: 'A premium feminine fragrance by Dior. Available in 50ml.',
    price: 95.0,
    stock: 8,
    gender: 'Feminine',
    size: '50ml',
    brand: 'Dior',
    category: 'Floral',
    image: 'https://images.unsplash.com/photo-1557682250-42c28f3be1c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
  },
  {
    id: 6,
    name: 'Woody Musk',
    description: 'A premium masculine fragrance by Jo Malone. Available in 100ml.',
    price: 110.0,
    stock: 15,
    gender: 'Masculine',
    size: '100ml',
    brand: 'Jo Malone',
    category: 'Woody',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
  },
  {
    id: 7,
    name: 'Lavender Dreams',
    description: 'A premium unisex fragrance by Gucci. Available in 50ml.',
    price: 85.5,
    stock: 20,
    gender: 'Unisex',
    size: '50ml',
    brand: 'Gucci',
    category: 'Floral',
    image: 'https://images.unsplash.com/photo-1567922045116-2a00fae2ed03?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
  },
  {
    id: 8,
    name: 'Spice Route',
    description: 'A premium masculine fragrance by Armani. Available in 100ml.',
    price: 125.0,
    stock: 10,
    gender: 'Masculine',
    size: '100ml',
    brand: 'Armani',
    category: 'Spicy',
    image: 'https://images.unsplash.com/photo-1572635196184-84e35138cf62?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'
  }
];

// Initial collections data from the provided file
const initialCollections: Collection[] = [
  {
    id: 101,
    name: 'Elegance',
    description: 'Premium French fragrance collection',
    image: 'https://images.unsplash.com/photo-1610461888750-10bfc601b874?q=80&w=1299&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    featured: true,
    products: [
      { id: 101, name: 'Eau de Parfum', price: 32000, type: 'perfume', image: 'https://images.unsplash.com/photo-1610461888750-10bfc601b874?q=80&w=1299&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 102, name: 'Body Mist', price: 15000, type: 'mist', image: 'https://images.unsplash.com/photo-1671642605304-2a0a812b5529?q=80&w=1227&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 103, name: 'Deodorant Spray', price: 8500, type: 'deodorant', image: 'https://images.unsplash.com/photo-1604523412953-ec5f89b57be3?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 104, name: 'Body Lotion', price: 12000, type: 'lotion', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
    ]
  },
  {
    id: 201,
    name: 'Mystique',
    description: 'Exotic scents from around the world',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    featured: true,
    products: [
      { id: 201, name: 'Eau de Toilette', price: 28000, type: 'perfume', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 202, name: 'Body Spray', price: 10000, type: 'spray', image: 'https://images.unsplash.com/photo-1714218740879-3dc44c7aa514?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 203, name: 'Roll-on Deodorant', price: 8000, type: 'deodorant', image: 'https://images.unsplash.com/photo-1614859280183-76e352127ca7?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 204, name: 'Scented Oil', price: 15000, type: 'oil', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
    ]
  },
  {
    id: 301,
    name: 'Floral Bliss',
    description: 'Delicate flower-inspired fragrances',
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    featured: false,
    products: [
      { id: 301, name: 'Perfume Extract', price: 45000, type: 'perfume', image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 302, name: 'Body Mist', price: 12000, type: 'mist', image: 'https://images.unsplash.com/photo-1709100198813-b43c16cfee95?q=80&w=1226&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 303, name: 'Cream Deodorant', price: 9000, type: 'deodorant', image: 'https://images.unsplash.com/photo-1614859280183-76e352127ca7?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 304, name: 'Shower Gel', price: 11000, type: 'gel', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
    ]
  },
  {
    id: 401,
    name: 'Urban Edge',
    description: 'Contemporary scents for modern lifestyle',
    image: 'https://images.unsplash.com/photo-1701291927826-c7775869d822?q=80&w=1310&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    featured: true,
    products: [
      { id: 401, name: 'Eau de Parfum', price: 30000, type: 'perfume', image: 'https://images.unsplash.com/photo-1701291927826-c7775869d822?q=80&w=1310&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 402, name: 'Body Spray', price: 13500, type: 'spray', image: 'https://images.unsplash.com/photo-1625842514211-f5125671c8d0?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 403, name: 'Stick Deodorant', price: 8200, type: 'deodorant', image: 'https://images.unsplash.com/photo-1706067501231-aab1ab1c1dbd?q=80&w=1226&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { id: 404, name: 'Body Scrub', price: 14000, type: 'scrub', image: 'https://images.unsplash.com/photo-1713716722076-df4fc658b328?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }
    ]
  }
];

// Create the store with both products and collections
export const useStore = create<StoreState>((set) => ({
  products: initialProducts,
  collections: initialCollections,
  isLoading: false,
  error: null,
  
  // Product actions
  addProduct: (product) => {
    set((state) => {
      const highestId = Math.max(...state.products.map(p => p.id), 0);
      const newProduct = {
        ...product,
        id: highestId + 1
      };
      
      return {
        products: [...state.products, newProduct]
      };
    });
  },
  
  updateProduct: (id, updatedProduct) => {
    set((state) => ({
      products: state.products.map(product => 
        product.id === id 
          ? { ...product, ...updatedProduct } 
          : product
      )
    }));
  },
  
  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter(product => product.id !== id)
    }));
  },
  
  // Collection actions
  addCollection: (collection) => {
    set((state) => {
      const highestId = Math.max(
        ...state.collections.map(c => c.id).filter((id): id is number => typeof id === 'number'),
        0
      );
      const newCollection = {
        ...collection,
        id: highestId + 1
      };
      
      return {
        collections: [...state.collections, newCollection]
      };
    });
  },
  
  updateCollection: (id, updatedCollection) => {
    set((state) => ({
      collections: state.collections.map(collection => 
        collection.id === id 
          ? { ...collection, ...updatedCollection } 
          : collection
      )
    }));
  },
  
  deleteCollection: (id) => {
    set((state) => ({
      collections: state.collections.filter(collection => collection.id !== id)
    }));
  },
  
  // Utility functions
  generateImageLink: async (file) => {
    // Set loading state
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call to upload image
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random image URL for demonstration
      const imageIndex = Math.floor(Math.random() * 1000);
      const imageUrl = `https://picsum.photos/id/${imageIndex}/400/400`;
      
      // Clear loading state
      set({ isLoading: false });
      
      return imageUrl;
    } catch (error) {
      // Handle error
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to upload image' 
      });
      throw error;
    }
  }
}));