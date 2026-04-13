
import React, { useState, useEffect } from 'react';
import { ShoppingBag, HandPlatter, History, CalendarClock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ScheduleOrderModal } from './ScheduleOrderModal';

export const Navbar: React.FC = () => {
  const { itemCount, total, setIsCartOpen, setIsHistoryOpen, scheduledTime } = useCart();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);

  // Trigger animation when item count changes
  useEffect(() => {
    if (itemCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  return (
    <>
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-brand-red p-2 rounded-lg text-white">
                <HandPlatter size={24} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-5xl font-display font-bold text-brand-dark tracking-tight leading-none">
                  Chow~Sho!
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Schedule Button */}
              <button 
                onClick={() => setIsScheduleModalOpen(true)}
                className={`p-2 transition-colors rounded-full hover:bg-gray-100 relative group ${scheduledTime ? 'text-brand-red' : 'text-brand-dark'}`}
                title={scheduledTime ? `Scheduled: ${new Date(scheduledTime).toLocaleString()}` : "Schedule Order"}
              >
                <CalendarClock size={24} />
                {scheduledTime && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-red rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* History Trigger */}
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 text-brand-dark hover:text-brand-red transition-colors rounded-full hover:bg-gray-100"
                title="Order History"
              >
                <History size={24} />
              </button>

              {/* Cart Trigger */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className={`flex items-center space-x-1 p-2 text-brand-dark hover:text-brand-red transition-all group ${animateCart ? 'scale-110' : 'scale-100'}`}
              >
                {total > 0 && (
                   <span className="font-display font-bold text-lg mr-1">${total.toFixed(2)}</span>
                )}
                <div className="relative">
                  <ShoppingBag size={28} className={animateCart ? 'text-brand-red' : ''} />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-red rounded-full group-hover:scale-110 transition-transform">
                      {itemCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {isScheduleModalOpen && <ScheduleOrderModal onClose={() => setIsScheduleModalOpen(false)} />}
    </>
  );
};
