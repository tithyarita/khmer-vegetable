import Profile from '../assets/images/profile.png'
import Tomato from '../assets/images/Tomato3.png'

export const farmers = [
  {
    id: 1,
    image: Profile,
    name: 'Sokha Mean',
    farm: 'Emerald Grove Farm',
    location: "Sa'ang District, Kandal Province",
    desc: 'For three generations, my family has nurtured the soil of Emerald Grove. We believe that true nutrition starts with respect for the land.',
    quote: 'For three generations, my family has nurtured the soil of Emerald Grove. We believe that true nutrition starts with respect for the land and the patience to let nature lead the way.',
    badges: [
      { label: 'MASTER GROWER', icon: '⭐', style: 'badge-gold' },
      { label: '100% ORGANIC', icon: '🌿', style: 'badge-green' },
      { label: 'PESTICIDE FREE', icon: '🔒', style: 'badge-blue' },
    ],
    stats: [
      { value: '12+', label: 'Years Active' },
      { value: '100%', label: 'Organic' },
      { value: '4.9', label: 'Rating' },
    ],
    products: [
      { id: 1, category: 'Cruciferous', name: 'Organic Heirloom Broccoli Crown', rating: '5.0', price: '2.99', oldPrice: '3.50', image: Tomato },
      { id: 2, category: 'Leafy Greens', name: 'Organic Curly Kale Bunch', rating: '4.9', price: '2.50', oldPrice: '3.20', image: Tomato },
      { id: 3, category: 'Cruciferous', name: 'Cauliflower Crown', rating: '4.8', price: '2.79', oldPrice: '3.29', image: Tomato },
      { id: 4, category: 'Leafy Greens', name: 'Fresh Spinach Bunch', rating: '4.7', price: '1.80', oldPrice: '2.20', image: Tomato },
    ],
  },
  {
    id: 2,
    image: Profile,
    name: 'Malis Chan',
    farm: 'Mekong Harvest Co.',
    location: 'Kampong Cham Province',
    desc: 'Growing the finest tropical vegetables along the Mekong riverbanks using traditional Khmer farming wisdom passed down for generations.',
    quote: 'The Mekong gives us life, and we give back by cultivating the land with care. Every vegetable tells a story of our heritage.',
    badges: [
      { label: 'SUSTAINABLE', icon: '🌱', style: 'badge-green' },
      { label: 'FAMILY FARM', icon: '👨‍🌾', style: 'badge-gold' },
      { label: 'LOCAL FAVORITE', icon: '❤️', style: 'badge-blue' },
    ],
    stats: [
      { value: '8+', label: 'Years Active' },
      { value: '98%', label: 'Organic' },
      { value: '4.8', label: 'Rating' },
    ],
    products: [
      { id: 5, category: 'Vegetables', name: 'Sweet Red Bell Peppers (3 Pack)', rating: '4.5', price: '3.45', oldPrice: '4.00', image: Tomato },
      { id: 6, category: 'Tubers', name: 'Russet Potatoes (5lb)', rating: '4.4', price: '3.99', oldPrice: '4.99', image: Tomato },
      { id: 7, category: 'Root Veg', name: 'Fresh Garden Radish (Bunch)', rating: '4.8', price: '1.99', oldPrice: '2.50', image: Tomato },
      { id: 8, category: 'Vegetables', name: 'Green Cabbage Head', rating: '4.3', price: '1.49', oldPrice: '1.99', image: Tomato },
    ],
  },
  {
    id: 3,
    image: Profile,
    name: 'Vannak Som',
    farm: 'Tonle Sap Fresh',
    location: 'Battambang Province',
    desc: 'Providing the community with premium organic vegetables grown in the fertile floodplains of Tonle Sap Lake.',
    quote: 'Nature provides everything we need. I just help it along. My vegetables are grown with love, not chemicals.',
    badges: [
      { label: 'CHEMICAL-FREE', icon: '🧪', style: 'badge-blue' },
      { label: 'TOP RATED', icon: '🏆', style: 'badge-gold' },
      { label: 'ORGANIC', icon: '🌿', style: 'badge-green' },
    ],
    stats: [
      { value: '15+', label: 'Years Active' },
      { value: '100%', label: 'Organic' },
      { value: '5.0', label: 'Rating' },
    ],
    products: [
      { id: 9, category: 'Cruciferous', name: 'Organic Heirloom Broccoli Crown', rating: '5.0', price: '2.99', oldPrice: '3.50', image: Tomato },
      { id: 10, category: 'Root Veg', name: 'Purple Carrots', rating: '4.6', price: '2.49', oldPrice: '3.00', image: Tomato },
      { id: 11, category: 'Tubers', name: 'Sweet Potatoes (3lb)', rating: '4.5', price: '2.99', oldPrice: '3.49', image: Tomato },
      { id: 12, category: 'Leafy Greens', name: 'Organic Curly Kale Bunch', rating: '5.0', price: '2.50', oldPrice: '3.20', image: Tomato },
    ],
  },
  {
    id: 4,
    image: Profile,
    name: 'Sreyneang Keo',
    farm: 'Sun-Kissed Acres',
    location: 'Takeo Province',
    desc: 'A new generation farmer bringing innovative organic techniques to traditional Cambodian agriculture.',
    quote: 'Farming is not just my job — it is my passion. Every sunrise in the field reminds me why I chose this path.',
    badges: [
      { label: 'INNOVATOR', icon: '💡', style: 'badge-gold' },
      { label: 'ORGANIC', icon: '🌿', style: 'badge-green' },
      { label: 'WOMAN FARMER', icon: '👩‍🌾', style: 'badge-blue' },
    ],
    stats: [
      { value: '5+', label: 'Years Active' },
      { value: '100%', label: 'Organic' },
      { value: '4.7', label: 'Rating' },
    ],
    products: [
      { id: 13, category: 'Leafy Greens', name: 'Kale Smoothie Pack', rating: '4.2', price: '4.99', oldPrice: '5.99', image: Tomato },
      { id: 14, category: 'Vegetables', name: 'Sweet Red Bell Peppers (3 Pack)', rating: '4.5', price: '3.45', oldPrice: '4.00', image: Tomato },
      { id: 15, category: 'Cruciferous', name: 'Organic Heirloom Broccoli Crown', rating: '5.0', price: '2.99', oldPrice: '3.50', image: Tomato },
      { id: 16, category: 'Root Veg', name: 'Fresh Garden Radish (Bunch)', rating: '4.8', price: '1.99', oldPrice: '2.50', image: Tomato },
    ],
  },
  {
    id: 4,
    image: Profile,
    name: 'Sreyneang Keo',
    farm: 'Sun-Kissed Acres',
    location: 'Takeo Province',
    desc: 'A new generation farmer bringing innovative organic techniques to traditional Cambodian agriculture.',
    quote: 'Farming is not just my job — it is my passion. Every sunrise in the field reminds me why I chose this path.',
    badges: [
      { label: 'INNOVATOR', icon: '💡', style: 'badge-gold' },
      { label: 'ORGANIC', icon: '🌿', style: 'badge-green' },
      { label: 'WOMAN FARMER', icon: '👩‍🌾', style: 'badge-blue' },
    ],
    stats: [
      { value: '5+', label: 'Years Active' },
      { value: '100%', label: 'Organic' },
      { value: '4.7', label: 'Rating' },
    ],
    products: [
      { id: 13, category: 'Leafy Greens', name: 'Kale Smoothie Pack', rating: '4.2', price: '4.99', oldPrice: '5.99', image: Tomato },
      { id: 14, category: 'Vegetables', name: 'Sweet Red Bell Peppers (3 Pack)', rating: '4.5', price: '3.45', oldPrice: '4.00', image: Tomato },
      { id: 15, category: 'Cruciferous', name: 'Organic Heirloom Broccoli Crown', rating: '5.0', price: '2.99', oldPrice: '3.50', image: Tomato },
      { id: 16, category: 'Root Veg', name: 'Fresh Garden Radish (Bunch)', rating: '4.8', price: '1.99', oldPrice: '2.50', image: Tomato },
    ],
  },
]

export function getFarmerById(id) {
  return farmers.find(f => f.id === Number(id)) || farmers[0]
}
