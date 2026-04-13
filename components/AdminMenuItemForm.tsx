import React, { useState } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
import { MenuItem } from '../types';

interface AdminMenuItemFormProps {
  onAdd: (item: MenuItem) => void;
  onClose: () => void;
}

export const AdminMenuItemForm: React.FC<AdminMenuItemFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'Burgers',
    imageSeed: Math.floor(Math.random() * 1000),
    calories: 0,
    available: true,
    featured: false
  });

  const categories: MenuItem['category'][] = ['Burgers', 'Pizzas', 'Sides', 'Desserts', 'Drinks', 'Specials'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.price) return;

    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: formData.name!,
      description: formData.description!,
      price: Number(formData.price),
      category: formData.category as MenuItem['category'],
      imageSeed: Number(formData.imageSeed),
      calories: Number(formData.calories),
      available: true,
      featured: formData.featured
    };

    onAdd(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-brand-dark text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-display font-bold">Add New Menu Item</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition"><X size={20} /></button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name & Category Row */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                  placeholder="Super Burger"
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none bg-white"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none resize-none"
              placeholder="Delicious details..."
            />
          </div>

          {/* Price & Calories */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                  placeholder="9.99"
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Calories</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.calories || ''}
                  onChange={e => setFormData({...formData, calories: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none"
                  placeholder="500"
                />
             </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2 mb-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer w-fit" onClick={() => setFormData({...formData, featured: !formData.featured})}>
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${formData.featured ? 'bg-brand-yellow text-brand-dark' : 'bg-white border border-gray-300'}`}>
                {formData.featured && <Sparkles size={12} />}
              </div>
              <span className="text-sm font-bold text-gray-700 select-none">Featured Item</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-brand-red text-white font-bold rounded-lg hover:bg-red-600 transition flex items-center gap-2 shadow-lg"
            >
              <Save size={18} /> Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};