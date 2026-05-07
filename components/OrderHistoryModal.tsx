
import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Calendar, Clock, Bike, Store, MapPin, CheckCircle, ChefHat, Package, Home, User, MessageCircle, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { OrderHistoryItem, OrderStatus } from '../types';
import { STORE_COORDINATES } from '../constants';

export const OrderHistoryModal: React.FC = () => {
  const { isHistoryOpen, setIsHistoryOpen, orderHistory, addToCart } = useCart();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isHistoryOpen) return null;

  const handleReorder = (items: any[]) => {
    items.forEach(item => {
      for(let i = 0; i < item.quantity; i++) {
        addToCart(item);
      }
    });
    setIsHistoryOpen(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'placed': return 'text-blue-500';
      case 'preparing': return 'text-orange-500';
      case 'out_for_delivery': return 'text-purple-500';
      case 'ready': return 'text-green-500';
      case 'completed': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getEstimatedArrival = (dateString: string) => {
    const d = new Date(dateString);
    d.setMinutes(d.getMinutes() + 45); // Approx 45 min delivery
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const StatusTimeline = ({ order }: { order: OrderHistoryItem }) => {
    const [simulatedProgress, setSimulatedProgress] = useState(15);
    
    // Simulate real-time driver movement if out for delivery
    useEffect(() => {
      if (order.status === 'out_for_delivery') {
        const interval = setInterval(() => {
          setSimulatedProgress(prev => {
            if (prev >= 85) return 15; // Loop for simulation
            return prev + 0.5;
          });
        }, 100);
        return () => clearInterval(interval);
      }
    }, [order.status]);

    // Determine progress index
    const stages: OrderStatus[] = order.details.orderType === 'delivery' 
      ? ['placed', 'preparing', 'out_for_delivery', 'completed']
      : ['placed', 'preparing', 'ready', 'completed'];

    const currentStatus = order.status;
    let currentStatusIndex = stages.indexOf(currentStatus);
    
    // Fallback if status mismatch (e.g. legacy data)
    if (currentStatusIndex === -1) currentStatusIndex = stages.length - 1;

    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
          <span>Order Status</span>
          <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 uppercase ${getStatusColor(currentStatus)}`}>
            {currentStatus.replace(/_/g, ' ')}
          </span>
        </h4>
        
        {/* Progress Bar */}
        <div className="relative flex justify-between mb-6">
          {/* Line */}
          <div className="absolute top-3 left-0 w-full h-1 bg-gray-200 -z-10"></div>
          <div 
            className="absolute top-3 left-0 h-1 bg-brand-red transition-all duration-1000 -z-10"
            style={{ width: `${(currentStatusIndex / (stages.length - 1)) * 100}%` }}
          ></div>

          {stages.map((stage, idx) => {
            const isActive = idx <= currentStatusIndex;
            const Icon = stage === 'placed' ? CheckCircle 
                       : stage === 'preparing' ? ChefHat 
                       : stage === 'out_for_delivery' ? Bike 
                       : stage === 'ready' ? Store
                       : Package;

            return (
              <div key={stage} className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isActive ? 'bg-brand-red border-brand-red text-white' : 'bg-white border-gray-300 text-gray-300'
                }`}>
                  <Icon size={14} />
                </div>
                <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-brand-dark' : 'text-gray-300'}`}>
                  {stage.replace(/_/g, ' ').split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Map / Action Area */}
        {order.details.orderType === 'delivery' && currentStatus === 'out_for_delivery' && (
           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 mb-3 animate-fade-in shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="bg-brand-red p-2 rounded-full shadow-lg text-white ring-4 ring-brand-red/10">
                      <Bike size={20} />
                    </div>
                    <motion.div 
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Your order is on the way!</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-wider font-bold">
                       Est: <span className="text-blue-600">{getEstimatedArrival(order.date)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-white rounded-full text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 transition">
                    <MessageCircle size={16} />
                  </button>
                  <button className="p-2 bg-white rounded-full text-blue-600 shadow-sm border border-blue-100 hover:bg-blue-50 transition">
                    <Navigation size={16} />
                  </button>
                </div>
             </div>

             {order.details.coordinates && (
                <div className="relative h-44 bg-[#e5e7eb] rounded-xl overflow-hidden shadow-inner border border-gray-200">
                    {/* Simulated Map Background */}
                    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0,50 L100,50" stroke="#d1d5db" strokeWidth="10" fill="none" />
                      <path d="M50,0 L50,100" stroke="#d1d5db" strokeWidth="10" fill="none" />
                      <rect x="10" y="10" width="15" height="15" fill="#9ca3af" rx="2" />
                      <rect x="75" y="75" width="15" height="15" fill="#9ca3af" rx="2" />
                      <circle cx="85" cy="25" r="10" fill="#a7f3d0" /> {/* Park */}
                    </svg>
                    
                    {/* Road Network */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-gray-300/50"></div>
                    
                    {/* Path Line */}
                    <div className="absolute top-1/2 left-[10%] right-[10%] h-1 bg-blue-200 -translate-y-1/2 rounded-full overflow-hidden">
                       <motion.div 
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((simulatedProgress - 15) / 70) * 100}%` }}
                       />
                    </div>

                    {/* Store Pin */}
                    <div className="absolute top-1/2 left-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                        <div className="p-1.5 bg-brand-dark rounded-full shadow-md text-white">
                          <Store size={14} />
                        </div>
                        <span className="text-[8px] font-bold text-gray-600 bg-white/80 px-1 rounded mt-1">Shop</span>
                    </div>

                    {/* House Pin */}
                    <div className="absolute top-1/2 right-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                        <motion.div 
                          className="p-1.5 bg-brand-red rounded-full shadow-md text-white"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Home size={14} />
                        </motion.div>
                        <span className="text-[8px] font-bold text-brand-red bg-white/80 px-1 rounded mt-1">You</span>
                    </div>
                    
                    {/* Animated Bike */}
                    <motion.div 
                        className="absolute top-1/2 -translate-y-1/2 z-20"
                        style={{ left: `${simulatedProgress}%` }}
                    >
                         <div className="bg-white p-1 rounded-full shadow-xl border border-blue-100 flex items-center justify-center">
                             <Bike size={18} className="text-brand-red transform -scale-x-100"/>
                         </div>
                         {/* Location Pings */}
                         <motion.div 
                            className="absolute inset-0 bg-blue-400 rounded-full z-[-1]"
                            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                         />
                    </motion.div>

                    {/* Simulation Labels */}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-100 flex items-center gap-1">
                        <User size={10} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-gray-700">Driver: John</span>
                      </div>
                      <div className="bg-brand-red/90 backdrop-blur-sm px-2 py-1 rounded-lg text-white animate-pulse">
                        <span className="text-[10px] font-bold">Driving Fast! ⚡</span>
                      </div>
                    </div>
                </div>
             )}
           </div>
        )}

        {/* Pickup Action */}
        {order.details.orderType === 'pickup' && currentStatus === 'ready' && (
           <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 mb-3 text-center animate-fade-in shadow-xl">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />
             
             <div className="relative z-10">
                <motion.div 
                  className="inline-block p-4 bg-white/20 backdrop-blur-md text-white rounded-full mb-4 ring-8 ring-white/10"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Store size={40} />
                </motion.div>
                <h3 className="text-white font-display font-bold text-2xl mb-2 drop-shadow-md">It's Ready! 🥡</h3>
                <p className="text-green-50 font-medium text-sm mb-6 max-w-xs mx-auto">Your feast is hot and waiting at the counter. Come and get it!</p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${STORE_COORDINATES.lat},${STORE_COORDINATES.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold text-sm shadow-lg hover:bg-green-50 transition-all active:scale-95"
                  >
                    <MapPin size={18}/> Get Directions
                  </a>
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700/50 backdrop-blur-sm text-white border border-white/20 rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-700/70 transition-all active:scale-95">
                    <CheckCircle size={18} /> I'm Here!
                  </button>
                </div>
             </div>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsHistoryOpen(false)} 
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
         <div className="p-4 bg-brand-dark text-white flex justify-between items-center shadow-md shrink-0">
            <h2 className="text-xl font-display font-bold">Order History</h2>
            <button 
              onClick={() => setIsHistoryOpen(false)} 
              className="p-1 hover:bg-white/20 rounded-full transition"
            >
              <X size={24} />
            </button>
         </div>
         
         <div className="overflow-y-auto p-4 space-y-4 bg-gray-50 flex-1">
            {orderHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 min-h-[300px]">
                  <Clock size={64} className="opacity-20" />
                  <p className="text-lg">No past orders found.</p>
                  <p className="text-sm">Time to order some tasty treats! 🍔</p>
                </div>
            ) : (
                orderHistory.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition hover:shadow-md">
                        <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                            <div>
                                <p className="font-bold text-gray-800 flex items-center gap-2">
                                    <Calendar size={14} className="text-brand-red" /> 
                                    {new Date(order.date).toLocaleDateString()}
                                    <Clock size={14} className="ml-2 text-brand-red" /> 
                                    {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                                    order.method === 'WhatsApp' 
                                      ? 'bg-green-50 text-green-700 border-green-100' 
                                      : 'bg-gray-100 text-gray-700 border-gray-200'
                                  }`}>
                                      {order.method}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border ${
                                      order.details.orderType === 'delivery' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                  }`}>
                                      {order.details.orderType === 'delivery' ? <Bike size={10}/> : <Store size={10}/>}
                                      {order.details.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                                  </span>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-brand-red">${order.total.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-1 mb-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm text-gray-600 border-b border-gray-50 last:border-0 py-1">
                                    <span className="font-medium">{item.quantity}x {item.name}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                              className="flex-1 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition text-sm"
                          >
                              {expandedId === order.id ? 'Hide Tracking' : 'Track Order'}
                          </button>
                          <button
                              onClick={() => handleReorder(order.items)}
                              className="flex-1 py-2 bg-brand-red text-white hover:bg-red-600 font-bold rounded-lg transition flex items-center justify-center gap-2 group text-sm"
                          >
                              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
                              Reorder
                          </button>
                        </div>

                        {/* Expandable Tracking Section */}
                        {expandedId === order.id && (
                          <div className="animate-slide-down">
                            <StatusTimeline order={order} />
                          </div>
                        )}
                    </div>
                ))
            )}
         </div>
      </div>
    </div>
  );
}
