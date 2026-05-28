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

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addToCart: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item._id === product._id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item._id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      ),
    })),
  clearCart: () => set({ items: [] }),
}));
