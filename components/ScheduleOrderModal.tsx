import React, { useState, useEffect } from 'react';
import { X, CalendarClock, Save, Trash2, Clock, Check, Calendar } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ScheduleOrderModalProps {
  onClose: () => void;
}

export const ScheduleOrderModal: React.FC<ScheduleOrderModalProps> = ({ onClose }) => {
  const { scheduledTime, setScheduledTime, showNotification } = useCart();
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [activeDay, setActiveDay] = useState<'today' | 'tomorrow'>('today');

  useEffect(() => {
    if (scheduledTime) {
      setSelectedSlot(scheduledTime);
      const date = new Date(scheduledTime);
      const today = new Date();
      if (date.getDate() !== today.getDate()) {
        setActiveDay('tomorrow');
      }
    }
  }, [scheduledTime]);

  const generateSlots = (isTomorrow: boolean) => {
    const slots = [];
    const now = new Date();
    const targetDate = new Date(now);
    
    if (isTomorrow) {
      targetDate.setDate(targetDate.getDate() + 1);
      targetDate.setHours(10, 0, 0, 0); // Open at 10 AM
    } else {
      // Today: start from next 30 min slot, at least 45 mins from now for prep
      const minTime = new Date(now.getTime() + 45 * 60000);
      targetDate.setHours(minTime.getHours(), minTime.getMinutes() >= 30 ? 30 : 0, 0, 0);
      if (targetDate < minTime) {
        targetDate.setMinutes(targetDate.getMinutes() + 30);
      }
      if (targetDate.getHours() >= 21) return [];
    }

    const endHour = 21; // Close at 9 PM
    const current = new Date(targetDate);

    while (current.getHours() < endHour || (current.getHours() === endHour && current.getMinutes() === 0)) {
      const h = current.getHours();
      const m = current.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      const displayM = m === 0 ? '00' : '30';
      
      slots.push({
        value: current.toISOString(),
        label: `${displayH}:${displayM} ${ampm}`
      });

      current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
  };

  const todaySlots = generateSlots(false);
  const tomorrowSlots = generateSlots(true);
  const currentSlots = activeDay === 'today' ? todaySlots : tomorrowSlots;

  const handleSave = () => {
    if (!selectedSlot) return;
    setScheduledTime(selectedSlot);
    
    const date = new Date(selectedSlot);
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const displayM = m === 0 ? '00' : '30';
    const day = date.getDate() === new Date().getDate() ? 'Today' : 'Tomorrow';
    
    showNotification(`Order scheduled for ${day} at ${displayH}:${displayM} ${ampm} 📅`);
    onClose();
  };

  const handleClear = () => {
    setScheduledTime(null);
    setSelectedSlot('');
    showNotification("Schedule cleared");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-brand-red p-4 text-white flex justify-between items-center shrink-0">
            <h3 className="font-bold font-display text-lg flex items-center gap-2">
                <CalendarClock size={20} /> Schedule Order
            </h3>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition"><X size={20}/></button>
        </div>
        
        <div className="p-4 bg-gray-50 border-b border-gray-100 shrink-0">
             <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                <button 
                  onClick={() => setActiveDay('today')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeDay === 'today' ? 'bg-brand-red text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Calendar size={16} /> Today
                </button>
                <button 
                  onClick={() => setActiveDay('tomorrow')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeDay === 'tomorrow' ? 'bg-brand-red text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Calendar size={16} /> Tomorrow
                </button>
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {currentSlots.length > 0 ? (
              currentSlots.map((slot, idx) => (
                <button
                    key={idx}
                    onClick={() => setSelectedSlot(slot.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${
                        selectedSlot === slot.value 
                        ? 'bg-red-50 border-brand-red text-brand-red shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-700 hover:border-brand-red/50 hover:bg-gray-50'
                    }`}
                >
                    <span className="font-bold text-sm flex items-center gap-2">
                         <Clock size={16} className="opacity-70" /> {slot.label}
                    </span>
                    {selectedSlot === slot.value && <Check size={18} className="text-brand-red" />}
                </button>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No slots available for {activeDay}.</p>
                <p className="text-xs mt-1">We are closed or it's too late to order.</p>
              </div>
            )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
            <div className="flex gap-3">
                {scheduledTime && (
                    <button 
                        onClick={handleClear}
                        className="flex-1 py-2 text-red-500 font-bold hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} /> Clear
                    </button>
                )}
                <button 
                    onClick={handleSave}
                    disabled={!selectedSlot}
                    className="flex-1 py-3 bg-brand-dark text-white font-bold rounded-lg hover:bg-black transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} /> Confirm Time
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
