
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Burgers' | 'Pizzas' | 'Sides' | 'Drinks' | 'Specials' | 'Desserts';
  imageSeed: number;
  calories?: number;
  available: boolean;
  featured?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderType = 'delivery' | 'pickup';
export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed';

export interface OrderPreferences {
  contactless: boolean;
  noCutlery: boolean;
}

export interface OrderDetails {
  name: string;
  address: string;
  phone: string;
  notes: string;
  scheduledTime?: string; // Kept for backward compatibility logic
  scheduledSlot?: string; // New human readable slot
  orderType: OrderType;
  coordinates?: { lat: number; lng: number };
  distance?: number;
  preferences: OrderPreferences;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface OrderHistoryItem {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  method: 'WhatsApp' | 'Phone';
  status: OrderStatus;
  details: OrderDetails;
}

export interface InstagramPost {
  id: number;
  likes: number;
  comments: number;
  seed: number;
  caption: string;
}

export interface Reel {
  id: number;
  views: string;
  seed: number;
  caption: string;
}

export type NotificationType = 'success' | 'info' | 'delivery' | 'error' | 'warning';

export interface AppNotification {
  message: string;
  type: NotificationType;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
