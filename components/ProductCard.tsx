import React from 'react';
import { Product } from '@/types';
import { ArrowRight, CheckCircle } from 'lucide-react';
import CheckoutButton from './CheckoutButton';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-48 object-cover"
        />
        {product.popular && (
          <div className="absolute top-4 right-4 bg-brand-gold text-brand-indigo text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            POPULAR
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-brand-blue uppercase tracking-wider mb-2">
          {product.category}
        </div>
        <h3 className="font-heading font-bold text-xl text-brand-indigo mb-3 line-clamp-2">
          {product.title}
        </h3>
        <p className="font-sans text-gray-600 text-sm mb-6 flex-grow leading-relaxed">
          {product.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-2xl text-brand-gray">€{product.price.toFixed(2)}</span>
          <CheckoutButton product={product} variant="default" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
