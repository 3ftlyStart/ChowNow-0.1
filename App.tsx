
import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MenuCard } from './components/MenuCard';
import { CartDrawer } from './components/CartDrawer';
import { NonoAssistant } from './components/NonoAssistant';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { Toast } from './components/Toast';
import { AdminMenuItemForm } from './components/AdminMenuItemForm';
import { Hero } from './components/Hero';
import { InstagramFeed } from './components/InstagramFeed';
import { CartProvider, useCart } from './context/CartContext';
import { MENU_ITEMS, DEMO_REELS } from './constants';
import { MenuItem, InstagramPost } from './types';
import { Phone, Star, Search, X, Lock, Unlock, PlusCircle, ArrowUpDown, DollarSign, Filter, Heart, Sparkles } from 'lucide-react';

// Wrapper component to access useCart context for notifications and favorites
const AppContent: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // New Filter States
  const [sortOption, setSortOption] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  
  // Instagram State
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([
    { id: 1, likes: 124, comments: 12, seed: 801, caption: "Burger bliss! 🍔" },
    { id: 2, likes: 89, comments: 5, seed: 802, caption: "Pizza party time 🍕" },
    { id: 3, likes: 256, comments: 34, seed: 803, caption: "Sweet tooth satisfied 🍩" },
    { id: 4, likes: 167, comments: 18, seed: 804, caption: "Fries before guys 🍟" },
    { id: 5, likes: 432, comments: 56, seed: 805, caption: "Milkshake monday! 🥤" },
    { id: 6, likes: 98, comments: 9, seed: 806, caption: "Family feast vibes ✨" },
  ]);

  const { showNotification, favorites } = useCart();

  const categories = ['All', 'Burgers', 'Pizzas', 'Sides', 'Desserts', 'Drinks', 'Specials'];

  // Handle Search Input & Suggestions
  useEffect(() => {
    if (searchQuery.length > 1) {
      const matches = menuItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5)); // Limit to 5
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, menuItems]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (itemName: string) => {
    setSearchQuery(itemName);
    setShowSuggestions(false);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMinPrice = minPrice === '' || item.price >= minPrice;
    const matchesMaxPrice = maxPrice === '' || item.price <= maxPrice;

    const matchesFavorites = showFavoritesOnly ? favorites.includes(item.id) : true;
    
    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesFavorites;
  }).sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    return 0;
  });

  const handleCategoryChange = (category: string) => {
    if (category === activeCategory || isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      setActiveCategory(category);
      setIsAnimating(false);
    }, 300);
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  const handleAddItem = (newItem: MenuItem) => {
    setMenuItems(prev => [newItem, ...prev]);
    setIsAddFormOpen(false);
    setActiveCategory(newItem.category);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setSortOption('default');
    setMinPrice('');
    setMaxPrice('');
    setShowFavoritesOnly(false);
  };

  const handlePostToInstagram = (caption: string, topic: string) => {
    // Determine seed based on topic keywords to somewhat match food types
    let baseSeed = Math.floor(Math.random() * 1000);
    const t = topic.toLowerCase();
    
    if (t.includes('burger')) baseSeed = 100 + Math.floor(Math.random() * 99);
    else if (t.includes('pizza')) baseSeed = 200 + Math.floor(Math.random() * 99);
    else if (t.includes('fries') || t.includes('side')) baseSeed = 300 + Math.floor(Math.random() * 99);
    else if (t.includes('drink') || t.includes('shake')) baseSeed = 400 + Math.floor(Math.random() * 99);
    else if (t.includes('dessert') || t.includes('donut')) baseSeed = 600 + Math.floor(Math.random() * 99);

    const newPost: InstagramPost = {
      id: Date.now(),
      likes: 0,
      comments: 0,
      seed: baseSeed,
      caption: caption
    };

    setInstagramPosts(prev => [newPost, ...prev]);
    showNotification("Posted to Instagram! 📸", "info");
  };

  const hasActiveFilters = searchQuery || activeCategory !== 'All' || sortOption !== 'default' || minPrice !== '' || maxPrice !== '' || showFavoritesOnly;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <CartDrawer />
      <OrderHistoryModal />
      <NonoAssistant onPostToInstagram={handlePostToInstagram} />
      <Toast />
      
      {isAddFormOpen && (
        <AdminMenuItemForm 
          onAdd={handleAddItem} 
          onClose={() => setIsAddFormOpen(false)} 
        />
      )}

      {/* Hero Section */}
      <Hero />

      {/* Menu Section */}
      <main id="menu" className="flex-grow bg-brand-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center justify-between w-full max-w-4xl mb-6 relative">
                <h3 className="text-3xl font-display font-bold text-brand-dark mx-auto">Our Menu</h3>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isAdminMode && (
                    <button 
                      onClick={() => setIsAddFormOpen(true)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors bg-brand-red text-white hover:bg-red-600 shadow-md animate-fade-in"
                    >
                      <PlusCircle size={12} /> Add Item
                    </button>
                  )}
                  <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    isAdminMode ? 'bg-brand-dark text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                  >
                    {isAdminMode ? <Unlock size={12} /> : <Lock size={12} />}
                    {isAdminMode ? 'Admin On' : 'Admin Off'}
                  </button>
                </div>
            </div>
            
            {/* Search Bar & Suggestions */}
            <div className="w-full max-w-md relative mb-6 group z-20" ref={searchContainerRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-red transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                placeholder="Search for burgers, drinks..."
                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent shadow-sm transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-red transition-colors"
                >
                  <X size={18} />
                </button>
              )}
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-30">
                  {suggestions.map((sug) => (
                    <button
                      key={sug.id}
                      onClick={() => handleSuggestionClick(sug.name)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                    >
                       <img src={`https://picsum.photos/seed/${sug.imageSeed}/50/50`} alt="" className="w-8 h-8 rounded-full object-cover"/>
                       <div>
                         <p className="text-sm font-bold text-gray-800">{sug.name}</p>
                         <p className="text-xs text-brand-red font-medium">${sug.price.toFixed(2)}</p>
                       </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 ${
                    activeCategory === cat 
                      ? 'bg-brand-red text-white shadow-lg' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
              
              <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`px-4 py-2 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2 ${
                    showFavoritesOnly 
                      ? 'bg-pink-500 text-white shadow-lg' 
                      : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500 shadow-sm border border-gray-200'
                  }`}
                >
                  <Heart size={16} fill={showFavoritesOnly ? "currentColor" : "none"} /> Favorites
              </button>
            </div>

            {/* Advanced Filters (Sort & Price) */}
            <div className="w-full max-w-4xl bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                      <ArrowUpDown size={18} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Sort by:</span>
                  <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as any)}
                      className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 outline-none font-medium cursor-pointer"
                  >
                      <option value="default">Recommended</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                  </select>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center gap-2">
                      <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                            <DollarSign size={18} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 whitespace-nowrap hidden sm:inline">Price:</span>
                      <div className="flex items-center gap-2">
                          <input
                              type="number"
                              placeholder="Min"
                              min="0"
                              value={minPrice}
                              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                              className="w-20 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block p-2 outline-none"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                              type="number"
                              placeholder="Max"
                              min="0"
                              value={maxPrice}
                              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                              className="w-20 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block p-2 outline-none"
                          />
                      </div>
                  </div>
                  
                  {hasActiveFilters && (
                      <button 
                          onClick={clearAllFilters}
                          className="text-xs font-bold text-brand-red hover:underline whitespace-nowrap px-2"
                      >
                          Reset
                      </button>
                  )}
              </div>
            </div>
          </div>

          {/* Menu Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 transition-all duration-300 ease-in-out transform ${
            isAnimating ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
          }`}>
            {filteredItems.map((item) => (
              <MenuCard 
                key={item.id} 
                item={item} 
                isAdminMode={isAdminMode}
                onToggleAvailability={handleToggleAvailability}
                onPostToInstagram={handlePostToInstagram}
              />
            ))}
          </div>

          {filteredItems.length === 0 && !isAnimating && (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4 flex justify-center text-gray-300">
                <Filter size={48} />
              </div>
              <p className="text-lg font-medium">No yummy treats found with those filters.</p>
              <button 
                onClick={clearAllFilters}
                className="mt-4 text-brand-red font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      <InstagramFeed posts={instagramPosts} reels={DEMO_REELS} />

      {/* Features / Footer Banner */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-2xl bg-orange-50">
            <div className="w-12 h-12 bg-orange-100 text-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={24} />
            </div>
            <h4 className="font-bold text-lg mb-2">Dial-a-Delivery</h4>
            <p className="text-gray-600 text-sm">Just give us a ring and we'll bring the feast to your doorstep.</p>
          </div>
          <div className="p-6 rounded-2xl bg-green-50">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-xl">WA</span>
            </div>
            <h4 className="font-bold text-lg mb-2">WhatsApp Ordering</h4>
            <p className="text-gray-600 text-sm">Send your order directly through WhatsApp for instant processing.</p>
          </div>
            <div className="p-6 rounded-2xl bg-yellow-50">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={24} />
            </div>
            <h4 className="font-bold text-lg mb-2">Chow~Sho! Specials</h4>
            <p className="text-gray-600 text-sm">Best value family boxes and combos every single day.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-8 text-center">
        <p className="font-display font-bold text-lg mb-2 font-display">Chow~Sho!</p>
        <p className="text-gray-300 text-sm mb-3">7742 Victoria Range, Masvingo</p>
        <p className="text-gray-400 text-sm">© {new Date().getFullYear()} All rights reserved. Made with ❤️ & 🍔</p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
};
