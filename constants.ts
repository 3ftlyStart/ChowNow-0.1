
import { MenuItem, Reel } from './types';

export const WHATSAPP_NUMBER = "263717389919";
export const DELIVERY_PHONE = "+263 71 738 9919";
export const DELIVERY_FEE = 3.00;

// Location: Victoria Range, Masvingo, Zimbabwe (Approximate)
export const STORE_COORDINATES = { lat: -20.0925, lng: 30.8465 }; 
export const MAX_DELIVERY_RANGE_KM = 20;

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'b1',
    name: 'The Thriftly Classic',
    description: 'Double beef patty, cheddar, lettuce, tomato, special sauce.',
    price: 5.99,
    category: 'Burgers',
    imageSeed: 101,
    calories: 850,
    available: true,
    featured: true
  },
  {
    id: 'b2',
    name: 'Spicy Nono Crunch',
    description: 'Crispy chicken breast, spicy mayo, pickles, brioche bun.',
    price: 6.49,
    category: 'Burgers',
    imageSeed: 102,
    calories: 720,
    available: true
  },
  {
    id: 'p1',
    name: 'Pepperoni Feast',
    description: 'Loaded with double pepperoni and extra mozzarella.',
    price: 12.99,
    category: 'Pizzas',
    imageSeed: 201,
    calories: 1200,
    available: true
  },
  {
    id: 'p2',
    name: 'Veggie Delight',
    description: 'Bell peppers, onions, mushrooms, olives, corn.',
    price: 11.49,
    category: 'Pizzas',
    imageSeed: 202,
    calories: 950,
    available: true
  },
  {
    id: 's1',
    name: 'Golden Fries',
    description: 'Crispy salted fries.',
    price: 2.99,
    category: 'Sides',
    imageSeed: 301,
    calories: 350,
    available: true
  },
  {
    id: 's2',
    name: 'Onion Rings',
    description: 'Beer-battered onion rings with ranch dip.',
    price: 3.99,
    category: 'Sides',
    imageSeed: 302,
    calories: 450,
    available: false
  },
  {
    id: 'ds1',
    name: 'Chow~tastic Donuts',
    description: 'Warm, fluffy glazed rings of joy topped with Nono\'s signature rainbow sprinkles.',
    price: 3.99,
    category: 'Desserts',
    imageSeed: 601,
    calories: 450,
    available: true
  },
  {
    id: 'd1',
    name: 'Classic Cola',
    description: 'Ice cold refreshing cola.',
    price: 1.99,
    category: 'Drinks',
    imageSeed: 401,
    calories: 150,
    available: true
  },
  {
    id: 'd2',
    name: 'Nono Shake',
    description: 'Strawberry vanilla swirl milkshake.',
    price: 4.49,
    category: 'Drinks',
    imageSeed: 402,
    calories: 600,
    available: true
  },
  {
    id: 'sp1',
    name: 'Family Box',
    description: '2 Burgers, 1 Pizza, 2 Fries, 2 Drinks.',
    price: 24.99,
    category: 'Specials',
    imageSeed: 501,
    calories: 2500,
    available: true
  }
];

export const DEMO_REELS: Reel[] = [
  { id: 1, views: "1.2K", seed: 901, caption: "Making the Thriftly Classic! 🍔" },
  { id: 2, views: "856", seed: 902, caption: "POV: You ordered the Family Box 📦" },
  { id: 3, views: "2.5K", seed: 903, caption: "Shake it up! 🥤💃" },
  { id: 4, views: "900", seed: 904, caption: "Late night cravings? We got you." },
];
