
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { MenuItem, CartItem, OrderHistoryItem, OrderStatus, AppNotification, NotificationType } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  orderHistory: OrderHistoryItem[];
  addOrder: (order: OrderHistoryItem) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (isOpen: boolean) => void;
  notification: AppNotification | null;
  showNotification: (message: string, type?: NotificationType) => void;
  scheduledTime: string | null;
  setScheduledTime: (time: string | null) => void;
  favorites: string[];
  toggleFavorite: (itemId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const notificationTimeoutRef = useRef<number | null>(null);

  // Load cart and favorites from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nonos-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }

    const savedFavorites = localStorage.getItem('nonos-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    // Load history from local storage
    const savedHistory = localStorage.getItem('nonos-order-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Ensure legacy data doesn't break new features
        const sanitized = parsed.map((order: any) => ({
          ...order,
          status: order.status || 'completed',
          details: {
            ...order.details,
            orderType: order.details?.orderType || 'delivery'
          }
        }));
        setOrderHistory(sanitized);
      } catch (e) {
        console.error("Failed to parse order history", e);
      }
    }
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    localStorage.setItem('nonos-cart', JSON.stringify(cart));
  }, [cart]);

  // Save favorites to local storage
  useEffect(() => {
    localStorage.setItem('nonos-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save history to local storage on change
  useEffect(() => {
    localStorage.setItem('nonos-order-history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ message, type });
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  // Simulate Order Status Progression
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderHistory(prevHistory => {
        let hasChanges = false;
        const updatedHistory = prevHistory.map(order => {
          // Skip if already final state
          if (order.status === 'completed') return order;

          const minutesElapsed = (Date.now() - new Date(order.date).getTime()) / 60000;
          let newStatus: OrderStatus = order.status;

          // Simulation Timeline (Accelerated for demo)
          if (order.details.orderType === 'delivery') {
            // Delivery: placed -> preparing (0.5m) -> out_for_delivery (2m) -> completed (10m)
            if (minutesElapsed > 10) newStatus = 'completed';
            else if (minutesElapsed > 2 && order.status !== 'out_for_delivery') newStatus = 'out_for_delivery';
            else if (minutesElapsed > 0.5 && order.status === 'placed') newStatus = 'preparing';
          } else {
            // Pickup: placed -> preparing (0.5m) -> ready (2m) -> completed (15m/manual)
            if (minutesElapsed > 15) newStatus = 'completed';
            else if (minutesElapsed > 2 && order.status !== 'ready') newStatus = 'ready';
            else if (minutesElapsed > 0.5 && order.status === 'placed') newStatus = 'preparing';
          }

          if (newStatus !== order.status) {
            hasChanges = true;
            
            // Trigger Notifications for key state changes
            if (newStatus === 'out_for_delivery') {
              showNotification(`Order #${order.id.slice(-4)} is out for delivery! 🛵`, 'delivery');
            }
            if (newStatus === 'ready') {
              showNotification(`Order #${order.id.slice(-4)} is ready for pickup! 🥡`, 'success');
            }
            if (newStatus === 'completed' && order.details.orderType === 'delivery') {
              showNotification(`Order #${order.id.slice(-4)} has been delivered. Enjoy! 😋`, 'success');
            }
            
            return { ...order, status: newStatus };
          }
          return order;
        });

        return hasChanges ? updatedHistory : prevHistory;
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [showNotification]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showNotification(`Added ${item.name} to tray! 🍔`, 'success');
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const addOrder = (order: OrderHistoryItem) => {
    setOrderHistory(prev => [order, ...prev]);
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      if (prev.includes(itemId)) {
        showNotification("Removed from favorites", "info");
        return prev.filter(id => id !== itemId);
      } else {
        showNotification("Added to favorites! ❤️", "success");
        return [...prev, itemId];
      }
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount, isCartOpen, setIsCartOpen,
      orderHistory, addOrder, isHistoryOpen, setIsHistoryOpen, notification, showNotification,
      scheduledTime, setScheduledTime, favorites, toggleFavorite
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
