
import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle, Info, Bike, AlertCircle, AlertTriangle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { notification } = useCart();

  if (!notification) return null;

  const getStyle = () => {
    switch(notification.type) {
      case 'success': return 'bg-brand-dark border-gray-700 text-white';
      case 'delivery': return 'bg-blue-600 border-blue-700 text-white';
      case 'info': return 'bg-white border-gray-200 text-gray-800 shadow-xl';
      case 'error': return 'bg-red-600 border-red-700 text-white';
      case 'warning': return 'bg-orange-500 border-orange-600 text-white';
      default: return 'bg-brand-dark text-white';
    }
  };

  const getIcon = () => {
    switch(notification.type) {
      case 'success': return <CheckCircle className="text-green-400" size={20} />;
      case 'delivery': return <Bike className="text-white" size={20} />;
      case 'info': return <Info className="text-blue-500" size={20} />;
      case 'error': return <AlertCircle className="text-white" size={20} />;
      case 'warning': return <AlertTriangle className="text-white" size={20} />;
    }
  };

  return (
    <div className="fixed top-24 left-0 w-full flex justify-center z-[60] pointer-events-none px-4">
      <div className={`pointer-events-auto px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border animate-slide-down ${getStyle()}`}>
        {getIcon()}
        <span className="font-bold font-display tracking-wide">{notification.message}</span>
      </div>
    </div>
  );
};
