import React from 'react';
import { Phone, History } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DELIVERY_PHONE } from '../constants';

export const Hero: React.FC = () => {
  const { setIsHistoryOpen } = useCart();

  return (
    <div className="relative bg-brand-red overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-white max-w-2xl">
            <span className="inline-block bg-brand-yellow text-brand-dark px-4 py-1 rounded-full font-bold text-sm mb-4 transform -rotate-2">
              Dial-a-Delivery 24/7
            </span>
            <h2 className="text-5xl sm:text-6xl font-display font-bold mb-6 leading-tight">
              Tasty Treats,<br />
              <span className="text-brand-yellow">Thrifty Prices!</span>
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-lg">
              Order your favorite comfort food instantly via WhatsApp or a quick call. Fast, hot, and delicious.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <a href="#menu" className="bg-white text-brand-red px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-lg text-center flex items-center justify-center">
                Order Now
              </a>
              <a href={`tel:${DELIVERY_PHONE}`} className="flex items-center justify-center gap-2 bg-brand-dark/30 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-brand-dark/50 transition">
                <Phone size={20} /> Dial-a-Delivery
              </a>
               <button 
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center justify-center gap-2 bg-brand-yellow/10 backdrop-blur-sm border border-brand-yellow/50 text-brand-yellow px-6 py-3 rounded-xl font-bold text-lg hover:bg-brand-yellow/20 transition"
              >
                <History size={20} /> Past Orders
              </button>
            </div>
          </div>
          <div className="hidden sm:block relative w-80 h-80 lg:w-96 lg:h-96">
             {/* Decorative Hero Image */}
             <div className="absolute inset-0 bg-brand-yellow rounded-full opacity-20 blur-3xl animate-pulse"></div>
             <img 
               src="https://picsum.photos/seed/burgerHero/600/600" 
               alt="Delicious Burger" 
               className="relative w-full h-full object-cover rounded-full border-8 border-white/20 shadow-2xl transform hover:rotate-6 transition-transform duration-700"
             />
          </div>
        </div>
    </div>
  );
};