'use client';

import { useState, useMemo } from 'react';
import { ProductCategory } from '@/types';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const { products: allProducts, loading, error, refetch } = useProducts();

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const categories = new Set(allProducts.map(p => p.category));
    return ['All', ...Array.from(categories)];
  }, [allProducts]);
  
  const categories = availableCategories.length > 1 ? availableCategories : ['All'];

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') {
      return allProducts;
    }
    return allProducts.filter(p => p.category === activeCategory);
  }, [allProducts, activeCategory]);

  return (
    <div className="min-h-screen bg-brand-white pb-12 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-4xl text-brand-indigo mb-4">The Academy Store</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Practical tools designed for beginners. Whether you need a quick cheat sheet, a bundle, or a full guided course, start here.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-brand-indigo text-white rounded-lg font-semibold hover:bg-brand-blue transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            {categories.length > 1 && (
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
            )}

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-4">
                  {activeCategory === 'All' 
                    ? 'No products available right now.'
                    : 'No products found in this category right now.'}
                </p>
                {activeCategory === 'All' && (
                  <div className="mt-6 space-y-2">
                    <p className="text-sm text-gray-500">
                      Products are synced from Stripe. If you just created a product, it may take a moment to appear.
                    </p>
                    <p className="text-xs text-gray-400">
                      Make sure the product webhook events are configured in Stripe Dashboard.
                    </p>
                    <button
                      onClick={refetch}
                      className="mt-4 px-4 py-2 bg-brand-indigo text-white rounded-lg text-sm font-semibold hover:bg-brand-blue transition-colors"
                    >
                      Refresh Products
                    </button>
                  </div>
                )}
                {activeCategory !== 'All' && (
                  <button
                    onClick={() => setActiveCategory('All')}
                    className="text-brand-indigo hover:text-brand-blue font-medium"
                  >
                    View all products
                  </button>
                )}
              </div>
            )}
          </>
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

