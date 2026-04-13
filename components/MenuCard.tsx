
import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Power, Sparkles, Image as ImageIcon, Check, Instagram, Share2, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { generateMenuItemImage } from '../services/geminiService';
import { getCachedImage, cacheImage } from '../services/imageStorage';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon
} from 'react-share';

interface MenuCardProps {
  item: MenuItem;
  isAdminMode?: boolean;
  onToggleAvailability?: (id: string) => void;
  onPostToInstagram?: (caption: string, topic: string) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, isAdminMode, onToggleAvailability, onPostToInstagram }) => {
  const { addToCart, favorites, toggleFavorite } = useCart();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingEmoji, setLoadingEmoji] = useState('🍔');
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [particles, setParticles] = useState<{id: number, angle: number, distance: number, emoji: string, size: number}[]>([]);
  const [showShare, setShowShare] = useState(false);

  const isFavorite = favorites.includes(item.id);

  // Cycle emojis while loading
  useEffect(() => {
    if (loading) {
        const emojis = ['🍔', '🍕', '🍟', '🌭', '🍿', '🥤', '🍦', '🍩', '🍗', '🥗'];
        let idx = Math.floor(Math.random() * emojis.length);
        setLoadingEmoji(emojis[idx]);
        
        const interval = setInterval(() => {
            idx = (idx + 1) % emojis.length;
            setLoadingEmoji(emojis[idx]);
        }, 600);
        return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    let isMounted = true;
    const cacheKey = `nono-menu-img-${item.id}-${item.imageSeed}`;
    const failKey = `nono-menu-img-fail-v3-${item.id}`;
    const globalAbortKey = 'nono-img-gen-aborted';

    const fetchImage = async () => {
      // 1. Try to load from IndexedDB cache FIRST
      const cached = await getCachedImage(cacheKey);
      if (cached) {
        if (isMounted) {
          setImageUrl(cached);
          setLoading(false);
        }
        return;
      }

      // Image generation is disabled. We'll just use the fallback.
      if (isMounted) setLoading(false);
    };

    fetchImage();

    return () => { isMounted = false; };
  }, [item.id, item.imageSeed, item.name, item.description]);

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!item.available) return;
    
    // Trigger Logic
    addToCart(item);
    setIsAdded(true);
    
    // Trigger Particles
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Math.random(),
      angle: Math.random() * Math.PI * 2,
      distance: 50 + Math.random() * 100,
      emoji: ['😋', '🍔', '🍟', '🍕', '🍩', '✨'][Math.floor(Math.random() * 6)],
      size: 15 + Math.random() * 15
    }));
    setParticles(newParticles);

    // Cleanup
    setTimeout(() => {
      setIsAdded(false);
      setParticles([]);
    }, 1000);
  };

  const handleAdminInstaPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPostToInstagram) {
       onPostToInstagram(`Just launched: The ${item.name}! 📸 ${item.description.slice(0, 30)}... Come get it now! #ChowSho #${item.category}`, item.category);
    }
  }

  // Fallback to picsum if generation failed or not yet loaded
  const displayImage = imageUrl || `https://picsum.photos/seed/${item.imageSeed}/400/300`;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?item=${item.id}` : '';
  const shareTitle = `Check out the ${item.name} at Chow~Sho! 🍔`;

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 border ${item.featured ? 'border-brand-yellow ring-4 ring-brand-yellow/10' : 'border-transparent hover:border-brand-yellow/50'} flex flex-col h-full ${!item.available && !isAdminMode ? 'opacity-80 grayscale-[0.5]' : ''}`}>
      <div className="relative h-48 overflow-hidden bg-gray-50 flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50/50">
            <div className="relative flex items-center justify-center w-16 h-16">
                <Loader2 size={48} className="animate-spin text-brand-red/20 absolute" />
                <span className="text-2xl animate-bounce" style={{ animationDuration: '0.6s' }}>{loadingEmoji}</span>
            </div>
            <span className="text-xs font-bold text-gray-400 mt-2 animate-pulse">Preparing...</span>
          </div>
        ) : (
          imageError ? (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 text-gray-400">
               <div className="bg-white p-3 rounded-full shadow-sm mb-2">
                 <ImageIcon size={24} className="text-gray-300"/>
               </div>
               <span className="text-xs font-bold">Image Unavailable</span>
            </div>
          ) : (
            <img 
              src={displayImage} 
              alt={item.name} 
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transform transition-all duration-700 ease-out ${!item.available ? '' : 'group-hover:scale-110'} animate-fade-in`}
            />
          )
        )}
        
        {/* Favorite Button */}
        <button 
          onClick={(e) => {
             e.stopPropagation();
             toggleFavorite(item.id);
          }}
          className={`absolute top-2 right-2 z-30 p-2 rounded-full shadow-md transition-all active:scale-75 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400 hover:bg-white hover:text-red-400'}`}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Featured Badge */}
        {item.featured && (
             <div className="absolute top-0 left-0 z-20 bg-gradient-to-r from-brand-yellow to-yellow-300 text-brand-dark text-xs font-bold px-3 py-1 rounded-br-xl shadow-md flex items-center gap-1">
               <Sparkles size={12} /> Featured
             </div>
        )}
        
        {/* Admin Toggle */}
        {isAdminMode && (
          <div className="absolute top-12 left-2 z-30 flex flex-col gap-2">
             {onToggleAvailability && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleAvailability(item.id);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transform transition-transform active:scale-95 ${
                    item.available 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Power size={12} />
                  {item.available ? 'Stop Selling' : 'Start Selling'}
                </button>
             )}
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!item.available && (
          <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="bg-brand-red text-white px-4 py-2 font-bold transform -rotate-12 border-2 border-white shadow-lg text-lg uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute bottom-0 right-0 bg-brand-yellow text-brand-dark font-bold px-3 py-1 rounded-tl-xl text-sm z-10 shadow-sm">
          {item.calories} cal
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold font-display text-gray-800 leading-tight">{item.name}</h3>
          <span className="text-brand-red font-bold text-lg">${item.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-3">{item.description}</p>
        
        <div className="relative flex gap-2">
          <button 
            onClick={handleAddToCart}
            disabled={!item.available}
            className={`flex-1 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 overflow-hidden relative ${
              item.available 
                ? isAdded
                  ? 'bg-green-500 text-white shadow-green-200 shadow-lg'
                  : item.featured 
                    ? 'bg-brand-yellow text-brand-dark hover:bg-yellow-400' 
                    : 'bg-gray-100 hover:bg-brand-red hover:text-white text-brand-dark' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {item.available ? (
              isAdded ? (
                <>
                  <Check size={18} className="animate-bounce" /> Added!
                </>
              ) : (
                <>
                  <Plus size={18} /> Add
                </>
              )
            ) : (
              'Sold Out'
            )}
            
            {/* Particles */}
            <AnimatePresence>
              {particles.map((p: any) => (
                <motion.span 
                  key={p.id}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                  animate={{ 
                    x: Math.cos(p.angle) * p.distance, 
                    y: Math.sin(p.angle) * p.distance, 
                    opacity: 0,
                    scale: 1.5,
                    rotate: p.angle * 180 / Math.PI
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute pointer-events-none z-50"
                  style={{
                    left: '50%',
                    top: '50%',
                    fontSize: `${p.size}px`,
                  }}
                >
                  {p.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </button>

          {/* Share Button */}
          <button
            onClick={() => setShowShare(!showShare)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2.5 rounded-xl transition-colors active:scale-95"
            title="Share"
          >
            <Share2 size={20} />
          </button>

          {/* Share Menu */}
          {showShare && (
             <div className="absolute bottom-full right-0 mb-2 p-2 bg-white rounded-xl shadow-2xl border border-gray-100 flex gap-2 z-50 animate-fade-in-up items-center">
                 <FacebookShareButton url={shareUrl} hashtag="#ChowSho">
                    <FacebookIcon size={32} round />
                 </FacebookShareButton>
                 <TwitterShareButton url={shareUrl} title={shareTitle}>
                    <TwitterIcon size={32} round />
                 </TwitterShareButton>
                 <WhatsappShareButton url={shareUrl} title={shareTitle}>
                    <WhatsappIcon size={32} round />
                 </WhatsappShareButton>
                 <EmailShareButton url={shareUrl} subject={shareTitle} body={`Check this out: ${shareUrl}`}>
                    <EmailIcon size={32} round />
                 </EmailShareButton>
                 <div className="w-px h-6 bg-gray-200 mx-1"></div>
                 <button onClick={() => setShowShare(false)} className="bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                    <X size={14} />
                 </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
