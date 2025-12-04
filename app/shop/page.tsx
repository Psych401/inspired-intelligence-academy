'use client';

import { useState } from 'react';
import { PRODUCTS } from '@/constants';
import { ProductCategory } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Object.values(ProductCategory)];

  const filteredProducts = activeCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-brand-white pb-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-4xl text-brand-indigo mb-4">The Academy Store</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Practical tools designed for beginners. Whether you need a quick cheat sheet, a bundle, or a full guided course, start here.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-brand-indigo text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
           <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found in this category right now.</p>
           </div>
        )}

        {/* Safe Checkout Badge */}
        <div className="mt-20 flex flex-col items-center justify-center text-center">
           <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <span className="font-semibold">SECURE PAYMENT</span>
              <span>•</span>
              <span className="font-semibold">INSTANT DELIVERY</span>
              <span>•</span>
              <span className="font-semibold">VERIFIED QUALITY</span>
           </div>
           <p className="text-gray-500 text-xs">All transactions are encrypted and secure.</p>
        </div>

      </div>
    </div>
  );
}

