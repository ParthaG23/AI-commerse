import { create } from 'zustand';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  ratings: number;
}

interface ProductState {
  products: Product[];
  searchQuery: string;
  loading: boolean;
  setProducts: (products: Product[]) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  searchQuery: '',
  loading: false,
  setProducts: (products) => set({ products }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ loading }),
}));
