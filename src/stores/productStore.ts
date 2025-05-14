import create from 'zustand';
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}
interface ProductStore {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  setIsLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
}
export const useProductStore = create<ProductStore>(set => ({
  products: [],
  isLoading: false,
  error: null,
  setProducts: products => set({
    products
  }),
  addProduct: product => set(state => ({
    products: [...state.products, product]
  })),
  updateProduct: (id, updates) => set(state => ({
    products: state.products.map(product => product.id === id ? {
      ...product,
      ...updates
    } : product)
  })),
  deleteProduct: id => set(state => ({
    products: state.products.filter(product => product.id !== id)
  })),
  setIsLoading: value => set({
    isLoading: value
  }),
  setError: error => set({
    error
  })
}));