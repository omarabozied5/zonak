
import { create } from 'zustand';

export interface User {
  name: string;
  phone: string;
  token: string;
}

export interface Restaurant {
  id: number;
  name: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  category: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  restaurantId: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: number;
  total: number;
  status: string;
  date: string;
  time: string;
  customerName: string;
}

interface AppState {
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Restaurant
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, newQuantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => number;
  
  // Modal states
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  showOtp: boolean;
  setShowOtp: (show: boolean) => void;
  
  // Form states
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  userName: string;
  setUserName: (name: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // User
  user: null,
  setUser: (user) => set({ user }),
  
  // Restaurant
  selectedRestaurant: null,
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
  selectedCategory: 'الكل',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  // Cart
  cart: [],
  addToCart: (item, quantity = 1) => {
    const { cart } = get();
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      set({
        cart: cart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      });
    } else {
      set({
        cart: [...cart, { ...item, quantity }]
      });
    }
  },
  
  removeFromCart: (itemId) => {
    const { cart } = get();
    set({ cart: cart.filter(item => item.id !== itemId) });
  },
  
  updateQuantity: (itemId, newQuantity) => {
    const { cart, removeFromCart } = get();
    
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      set({
        cart: cart.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      });
    }
  },
  
  clearCart: () => set({ cart: [] }),
  
  calculateTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  // Modal states
  showLogin: false,
  setShowLogin: (show) => set({ showLogin: show }),
  showOtp: false,
  setShowOtp: (show) => set({ showOtp: show }),
  
  // Form states
  phoneNumber: '',
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  otp: '',
  setOtp: (otp) => set({ otp }),
  userName: '',
  setUserName: (name) => set({ userName: name }),
}));
