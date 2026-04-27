
import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Phone, MessageCircle, ChevronRight, ChevronLeft, MapPin, User, FileText, Smartphone, Check, AlertCircle, CalendarClock, Bike, Store, Navigation, Crosshair, UtensilsCrossed, DoorOpen } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { WHATSAPP_NUMBER, DELIVERY_PHONE, DELIVERY_FEE, STORE_COORDINATES, MAX_DELIVERY_RANGE_KM } from '../constants';
import { OrderDetails } from '../types';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, total, clearCart, addOrder, scheduledTime, setScheduledTime } = useCart();
  
  const [details, setDetails] = useState<OrderDetails>({ 
    name: '', 
    address: '', 
    phone: '', 
    notes: '', 
    orderType: 'delivery',
    preferences: { contactless: false, noCutlery: false }
  });
  
  const [step, setStep] = useState<'cart' | 'details' | 'confirm'>('cart');
  const [errors, setErrors] = useState<{name?: string, phone?: string, address?: string}>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [locating, setLocating] = useState(false);

  // Fee is 0 for pickup
  const currentDeliveryFee = details.orderType === 'delivery' ? DELIVERY_FEE : 0;
  const grandTotal = total + currentDeliveryFee;

  useEffect(() => {
    if (isCartOpen) {
      setErrors({});
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (isCartOpen && cart.length > 0) {
      setIsCalculating(true);
      const timer = setTimeout(() => setIsCalculating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cart, isCartOpen, details.orderType]);

  if (!isCartOpen) return null;

  const validateForm = () => {
    const newErrors: {name?: string, phone?: string, address?: string} = {};
    if (!details.name.trim()) newErrors.name = 'Name is required';
    if (!details.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Address validation for delivery
    if (details.orderType === 'delivery') {
      if (!details.address.trim()) {
        newErrors.address = 'Delivery address is required';
      } else if (details.address.trim().length < 10) {
        newErrors.address = 'Please provide a more complete address (e.g., Street Name, Number)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 'cart') {
      setStep('details');
    } else if (step === 'details') {
      if (validateForm()) {
        setStep('confirm');
      }
    }
  };

  const handleBack = () => {
    if (step === 'confirm') setStep('details');
    else if (step === 'details') setStep('cart');
  };

  // Haversine formula to calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distance in km
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = calculateDistance(latitude, longitude, STORE_COORDINATES.lat, STORE_COORDINATES.lng);
        
        setLocating(false);

        if (dist > MAX_DELIVERY_RANGE_KM) {
          setErrors(prev => ({ ...prev, address: `Too far! You are ${dist.toFixed(1)}km away. Max range is ${MAX_DELIVERY_RANGE_KM}km.` }));
        } else {
          setDetails(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
            distance: dist,
            address: prev.address ? prev.address : `Current Location (${dist.toFixed(1)}km from store)`
          }));
          // Clear address error if any
          setErrors(prev => ({ ...prev, address: undefined }));
        }
      },
      (error) => {
        setLocating(false);
        console.error("Error getting location", error);
        alert("Unable to retrieve your location");
      }
    );
  };

  const handleWhatsAppOrder = () => {
    const itemsList = cart.map(i => `• ${i.quantity}x ${i.name} ($${(i.price * i.quantity).toFixed(2)})`).join('\n');
    let message = `*New ${details.orderType.toUpperCase()} Order for ChowNow* 🍔\n\n` +
      `*Customer:* ${details.name}\n` +
      `*Phone:* ${details.phone}\n`;

    if (details.orderType === 'delivery') {
      message += `*Address:* ${details.address}\n`;
      if (details.distance) message += `*Distance:* ${details.distance.toFixed(1)}km\n`;
    }

    message += `*Notes:* ${details.notes}\n`;

    // Preferences
    if(details.preferences.contactless) message += `*Preference:* 📦 Contactless Delivery\n`;
    if(details.preferences.noCutlery) message += `*Preference:* 🍴 No Cutlery\n`;

    if (scheduledTime) {
      const displayTime = new Date(scheduledTime).toLocaleString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      message += `*Scheduled For:* ${displayTime}\n`;
    }

    message += `\n*Order Details:*\n${itemsList}\n`;
    
    if (details.orderType === 'delivery') {
      message += `Delivery Fee: $${DELIVERY_FEE.toFixed(2)}\n`;
    }
    
    message += `\n*Total: $${grandTotal.toFixed(2)}*`;

    // Coordinates link
    if (details.coordinates) {
      message += `\n\n📍 *Location:* https://maps.google.com/?q=${details.coordinates.lat},${details.coordinates.lng}`;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    finalizeOrder('WhatsApp');
    window.open(url, '_blank');
  };

  const handleDialDelivery = () => {
    finalizeOrder('Phone');
    window.location.href = `tel:${DELIVERY_PHONE}`;
  };

  const finalizeOrder = (method: 'WhatsApp' | 'Phone') => {
    addOrder({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...cart],
      total: grandTotal,
      method: method,
      status: 'placed',
      details: { 
        ...details, 
        scheduledTime: scheduledTime || undefined, // legacy support
        scheduledSlot: scheduledTime || undefined // new field support
      }
    });
    clearCart();
    setScheduledTime(null);
    setIsCartOpen(false);
    setStep('cart');
    setDetails({ name: '', address: '', phone: '', notes: '', orderType: 'delivery', preferences: { contactless: false, noCutlery: false } });
  };

  const StepIndicator = ({ currentStep }: { currentStep: string }) => {
    const steps = ['cart', 'details', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <div className="flex items-center justify-between px-8 py-4 bg-gray-50 border-b border-gray-100">
        {steps.map((s, idx) => (
          <div key={s} className="flex flex-col items-center relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              idx <= currentIndex ? 'bg-brand-red text-white shadow-md' : 'bg-gray-200 text-gray-500'
            }`}>
              {idx < currentIndex ? <Check size={14} /> : idx + 1}
            </div>
            <span className={`text-[10px] uppercase font-bold mt-1 tracking-wider ${
              idx <= currentIndex ? 'text-brand-dark' : 'text-gray-400'
            }`}>
              {s}
            </span>
          </div>
        ))}
        {/* Progress Line */}
        <div className="absolute top-[4.5rem] left-0 w-full px-12 pointer-events-none">
          <div className="h-0.5 bg-gray-200 w-full relative">
            <div 
              className="absolute top-0 left-0 h-full bg-brand-red transition-all duration-300" 
              style={{ width: `${currentIndex * 50}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Skeleton Components (Same as before)
  const CartSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 w-full">
            <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg h-12"></div>
    </div>
  );

  const SummarySkeleton = () => (
      <div className="space-y-6 animate-pulse">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="border-t border-dashed border-gray-200 pt-3">
                      <div className="flex justify-between">
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="h-6 bg-gray-200 rounded w-24"></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="p-4 bg-brand-red text-white flex justify-between items-center shadow-md z-20">
          <h2 className="text-xl font-display font-bold">Checkout</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Stepper */}
        {cart.length > 0 && <StepIndicator currentStep={step} />}

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <span className="text-6xl">🍟</span>
              <p className="text-lg font-medium">Your tray is empty!</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-brand-red font-bold hover:underline"
              >
                Go back to menu
              </button>
            </div>
          ) : (
            <>
              {step === 'cart' && (
                isCalculating ? <CartSkeleton /> : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={`https://picsum.photos/seed/${item.imageSeed}/100/100`} 
                            alt={item.name} 
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-bold text-gray-800">{item.name}</h3>
                            <p className="text-brand-red font-semibold">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-lg border">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:text-brand-red transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:text-brand-red transition"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Info box about fee */}
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-2 text-sm text-blue-700">
                       <Bike size={16} className="mt-0.5 shrink-0" />
                       <p>Delivery fee ($3.00) will be added at the next step if you choose delivery.</p>
                    </div>
                  </div>
                )
              )}

              {step === 'details' && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Order Type Toggle */}
                  <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button 
                      onClick={() => setDetails(d => ({...d, orderType: 'delivery'}))}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${details.orderType === 'delivery' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Bike size={16} /> Delivery
                    </button>
                    <button 
                      onClick={() => setDetails(d => ({...d, orderType: 'pickup'}))}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${details.orderType === 'pickup' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Store size={16} /> Pickup
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-gray-700 ml-1">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        value={details.name}
                        onChange={e => setDetails({...details, name: e.target.value})}
                        className={`w-full pl-10 pr-3 py-3 rounded-xl border ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-brand-red'} focus:ring-2 focus:ring-brand-red/20 focus:outline-none transition-all`}
                        placeholder="Nono Smith"
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-gray-700 ml-1">Phone Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="tel" 
                        value={details.phone}
                        onChange={e => setDetails({...details, phone: e.target.value})}
                        className={`w-full pl-10 pr-3 py-3 rounded-xl border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-brand-red'} focus:ring-2 focus:ring-brand-red/20 focus:outline-none transition-all`}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.phone}</p>}
                  </div>

                  {details.orderType === 'delivery' ? (
                    <div className="space-y-1 animate-fade-in">
                      <div className="flex justify-between items-center">
                         <label className="block text-sm font-bold text-gray-700 ml-1">Delivery Address <span className="text-red-500">*</span></label>
                         <button 
                           onClick={handleUseLocation}
                           disabled={locating}
                           className="text-xs flex items-center gap-1 text-brand-red hover:underline font-bold disabled:opacity-50"
                         >
                           {locating ? <span className="animate-spin">⌛</span> : <Crosshair size={12} />}
                           Use My Location
                         </button>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <textarea 
                          value={details.address}
                          onChange={e => setDetails({...details, address: e.target.value})}
                          className={`w-full pl-10 pr-3 py-3 rounded-xl border ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-brand-red'} focus:ring-2 focus:ring-brand-red/20 focus:outline-none transition-all h-24 resize-none`}
                          placeholder="123 Tasty Lane, Flavor Town"
                        />
                      </div>
                      {errors.address && <p className="text-red-500 text-xs ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.address}</p>}
                      {details.distance && !errors.address && (
                        <p className="text-xs text-green-600 ml-1 flex items-center gap-1 font-bold">
                          <Check size={10} /> Distance to store: {details.distance.toFixed(1)}km
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl space-y-3 animate-fade-in">
                       <h4 className="font-bold text-brand-dark flex items-center gap-2"><Store size={18}/> Pickup Location</h4>
                       <p className="text-sm text-gray-700">7742 Victoria Range, Masvingo</p>
                       
                       <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden relative">
                         {/* Static map representation */}
                         <img 
                            src="https://picsum.photos/seed/masvingo/400/200" 
                            className="w-full h-full object-cover opacity-80"
                            alt="Map Location"
                          />
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-brand-red text-white p-2 rounded-full shadow-lg animate-bounce">
                               <MapPin size={24} fill="white" />
                            </div>
                         </div>
                       </div>
                       
                       <a 
                         href={`https://www.google.com/maps/dir/?api=1&destination=${STORE_COORDINATES.lat},${STORE_COORDINATES.lng}`}
                         target="_blank"
                         rel="noreferrer"
                         className="block w-full text-center py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
                       >
                         <Navigation size={14} className="inline mr-1"/> Get Directions
                       </a>
                    </div>
                  )}
                  
                  {/* Preferences */}
                  <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Preferences</p>
                     
                     {details.orderType === 'delivery' && (
                       <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${details.preferences.contactless ? 'bg-brand-red border-brand-red' : 'border-gray-300 bg-white'}`}>
                             {details.preferences.contactless && <Check size={14} className="text-white" />}
                          </div>
                          <input 
                             type="checkbox" 
                             className="hidden" 
                             checked={details.preferences.contactless}
                             onChange={e => setDetails(d => ({...d, preferences: {...d.preferences, contactless: e.target.checked}}))}
                          />
                          <span className="flex-1 text-sm font-medium text-gray-700 flex items-center gap-2">
                             <DoorOpen size={16}/> Leave at door (Contactless)
                          </span>
                       </label>
                     )}

                     <label className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${details.preferences.noCutlery ? 'bg-brand-red border-brand-red' : 'border-gray-300 bg-white'}`}>
                           {details.preferences.noCutlery && <Check size={14} className="text-white" />}
                        </div>
                        <input 
                           type="checkbox" 
                           className="hidden" 
                           checked={details.preferences.noCutlery}
                           onChange={e => setDetails(d => ({...d, preferences: {...d.preferences, noCutlery: e.target.checked}}))}
                        />
                        <span className="flex-1 text-sm font-medium text-gray-700 flex items-center gap-2">
                           <UtensilsCrossed size={16}/> No Cutlery (Eco-Friendly)
                        </span>
                     </label>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-gray-700 ml-1">Notes (Optional)</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        value={details.notes}
                        onChange={e => setDetails({...details, notes: e.target.value})}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 focus:outline-none transition-all"
                        placeholder="Extra napkins, no onions..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 'confirm' && (
                isCalculating ? <SummarySkeleton /> : (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                      <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2">
                        {details.orderType === 'delivery' ? 'Delivery Details' : 'Pickup Details'}
                      </h3>
                      <div className="text-sm space-y-2 text-gray-600">
                        <p className="flex items-start gap-2"><User size={16} className="mt-0.5 text-gray-400"/> <span className="text-gray-800 font-medium">{details.name}</span></p>
                        <p className="flex items-start gap-2"><Smartphone size={16} className="mt-0.5 text-gray-400"/> {details.phone}</p>
                        
                        {details.orderType === 'delivery' && (
                          <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-gray-400"/> {details.address}</p>
                        )}
                        
                        {details.orderType === 'pickup' && (
                          <p className="flex items-start gap-2"><Store size={16} className="mt-0.5 text-gray-400"/> Pickup at: <span className="font-medium">Victoria Range, Masvingo</span></p>
                        )}

                        {scheduledTime && (
                          <p className="flex items-start gap-2 text-brand-red font-bold bg-red-50 p-2 rounded-lg">
                              <CalendarClock size={16} className="mt-0.5"/> 
                              Scheduled: {new Date(scheduledTime).toLocaleString([], { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                          </p>
                        )}
                        {details.notes && <p className="flex items-start gap-2"><FileText size={16} className="mt-0.5 text-gray-400"/> <span className="italic">"{details.notes}"</span></p>}
                        
                        {(details.preferences.contactless || details.preferences.noCutlery) && (
                            <div className="pt-2 mt-2 border-t border-gray-50 flex gap-2 flex-wrap">
                                {details.preferences.contactless && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                                        <DoorOpen size={10} /> Contactless
                                    </span>
                                )}
                                {details.preferences.noCutlery && (
                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                                        <UtensilsCrossed size={10} /> No Cutlery
                                    </span>
                                )}
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">Order Summary</h3>
                      <div className="space-y-2 mb-3">
                        {cart.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.quantity}x {item.name}</span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                              <span>Subtotal</span>
                              <span>${total.toFixed(2)}</span>
                          </div>
                          {details.orderType === 'delivery' ? (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Bike size={14}/> Delivery Fee</span>
                                <span>${DELIVERY_FEE.toFixed(2)}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                <span className="flex items-center gap-1"><Store size={14}/> Pickup</span>
                                <span>FREE</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                              <span className="font-bold text-gray-800">Total to Pay</span>
                              <span className="font-display font-bold text-xl text-brand-red">${grandTotal.toFixed(2)}</span>
                          </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            {isCalculating ? (
               <div className="space-y-3 animate-pulse">
                   <div className="flex justify-between mb-2">
                       <div className="h-4 bg-gray-200 rounded w-24"></div>
                       <div className="h-6 bg-gray-200 rounded w-20"></div>
                   </div>
                   <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
               </div>
            ) : (
                <div className="flex flex-col gap-3">
                  {step === 'cart' && (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600 font-medium">Subtotal <span className="text-xs text-gray-400 font-normal">(excl. delivery)</span></span>
                        <span className="text-2xl font-display font-bold text-brand-dark">${total.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={handleNext}
                        className="w-full bg-brand-red hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg transform active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        Checkout <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {step === 'details' && (
                    <div className="flex gap-3">
                      <button 
                        onClick={handleBack}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <ChevronLeft size={20} /> Back
                      </button>
                      <button 
                        onClick={handleNext}
                        className="flex-[2] bg-brand-dark hover:bg-black text-white font-bold py-3.5 rounded-xl transition shadow-lg transform active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        Review Order <ChevronRight size={20} />
                      </button>
                    </div>
                  )}

                  {step === 'confirm' && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <button 
                          onClick={handleDialDelivery}
                          className="flex items-center justify-center space-x-2 bg-brand-dark hover:bg-black text-white font-bold py-3.5 rounded-xl transition shadow-lg transform active:scale-[0.98]"
                        >
                          <Phone size={20} />
                          <span>Call Us</span>
                        </button>
                        <button 
                          onClick={handleWhatsAppOrder}
                          className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg transform active:scale-[0.98]"
                        >
                          <MessageCircle size={20} />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                      <button 
                        onClick={handleBack}
                        className="w-full text-sm text-gray-500 hover:text-gray-800 font-semibold py-2"
                      >
                        Back to Details
                      </button>
                    </>
                  )}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
