
import React, { useState } from 'react';
import { X, RefreshCw, Calendar, Clock, Bike, Store, MapPin, CheckCircle, ChefHat, Package, Home } from 'lucide-react';
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
           <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 mb-3 animate-fade-in">
             <div className="flex items-center gap-3">
               <div className="bg-white p-2 rounded-full animate-bounce shadow-sm text-blue-600">
                 <Bike size={24} />
               </div>
               <div>
                 <p className="text-sm font-bold text-blue-900">Your order is on the way!</p>
                 <p className="text-xs text-blue-700">Driver is nearby. Est: {getEstimatedArrival(order.date)}</p>
               </div>
             </div>
             {order.details.coordinates && (
                <div className="mt-3 h-32 bg-gray-200 rounded-xl overflow-hidden relative border border-gray-300 shadow-inner group">
                    {/* Simulated Map Visuals */}
                    <div className="absolute inset-0 bg-[#f0f0f0]">
                        {/* Roads */}
                        <div className="absolute top-1/2 left-0 right-0 h-6 bg-gray-300 transform -translate-y-1/2"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 w-6 bg-gray-300 transform -translate-x-1/2"></div>
                    </div>

                    {/* Store Pin */}
                    <div className="absolute top-1/2 left-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                        <Store size={16} className="text-gray-600" />
                        <span className="text-[9px] font-bold text-gray-500">Shop</span>
                    </div>

                    {/* House Pin */}
                    <div className="absolute top-1/2 right-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                        <Home size={16} className="text-brand-red" />
                        <span className="text-[9px] font-bold text-brand-red">You</span>
                    </div>
                    
                    {/* Animated Bike */}
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-[5000ms] ease-linear"
                        style={{ 
                            left: '15%',
                            animation: 'driveMap 5s linear infinite'
                        }}
                    >
                        <style>{`
                            @keyframes driveMap {
                                0% { left: 15%; }
                                50% { left: 85%; }
                                51% { left: 85%; opacity: 0; }
                                52% { left: 15%; opacity: 0; }
                                100% { left: 15%; opacity: 1; }
                            }
                        `}</style>
                         <div className="bg-white p-1 rounded-full shadow-md">
                             <Bike size={20} fill="currentColor" className="text-brand-red"/>
                         </div>
                    </div>
                </div>
             )}
           </div>
        )}

        {/* Pickup Action */}
        {order.details.orderType === 'pickup' && currentStatus === 'ready' && (
           <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3 text-center animate-fade-in shadow-sm">
             <div className="inline-block p-2 bg-green-100 text-green-600 rounded-full mb-2">
                <Store size={24} />
             </div>
             <p className="text-green-800 font-bold text-base mb-1">Ready for Pickup! 🥡</p>
             <p className="text-xs text-green-700 mb-3">Head to the counter to grab your feast.</p>
             
             <a 
               href={`https://www.google.com/maps/dir/?api=1&destination=${STORE_COORDINATES.lat},${STORE_COORDINATES.lng}`}
               target="_blank"
               rel="noreferrer"
               className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-200 rounded-lg text-xs font-bold shadow-sm hover:bg-green-50 text-green-800 transition"
             >
               <MapPin size={14}/> Get Directions
             </a>
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
